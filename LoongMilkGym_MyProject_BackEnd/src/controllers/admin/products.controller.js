const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const { deleteOldImage } = require("@/utils/cloudinary");
const { emitAdminEvent } = require("@/utils/admin-realtime.helper");

const isCloudinaryUrl = (url = "") => url.includes("res.cloudinary.com") || url.includes("cloudinary");

/**
 * Lấy danh sách sản phẩm (Admin)
 */
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const categoryId = req.query.categoryId || "";
    const status = req.query.status || "";
    const productType = req.query.productType || "";
    const sort = req.query.sort || "newest";

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc where
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (productType) {
      where.productType = productType;
    } else {
      // Chỉ tải các sản phẩm thuộc 3 loại được cấu hình: Dinh dưỡng, Phụ kiện, Trang phục
      where.productType = {
        in: ["supplement", "accessory", "apparel"]
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          slug: {
            contains: search,
          },
        },
      ];
    }

    // Sắp xếp orderBy
    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "name_asc") {
      orderBy = { title: "asc" };
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.success(
      {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      httpCodes.success,
      "Lấy danh sách sản phẩm thành công"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Lấy chi tiết sản phẩm
 */
const getProductDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        assets: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return res.error("Sản phẩm không tồn tại", httpCodes.notFound);
    }

    return res.success(product, httpCodes.success, "Lấy chi tiết sản phẩm thành công");
  } catch (err) {
    next(err);
  }
};

/**
 * Tạo sản phẩm mới
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      categoryId,
      productType,
      description,
      price,
      currency,
      status,
      metadata,
    } = req.body;

    // Validate
    if (!title || !title.trim()) {
      return res.error("Tên sản phẩm không được để trống", httpCodes.badRequest);
    }

    if (!slug || !slug.trim()) {
      return res.error("Đường dẫn (slug) không được để trống", httpCodes.badRequest);
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.error("Đường dẫn chỉ chứa chữ thường không dấu, số và dấu gạch ngang (ví dụ: whey-protein)", httpCodes.badRequest);
    }

    if (!productType || !["supplement", "accessory", "apparel"].includes(productType)) {
      return res.error("Loại sản phẩm không hợp lệ", httpCodes.badRequest);
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.error("Giá bán phải là số và không được nhỏ hơn 0", httpCodes.badRequest);
    }

    const finalStatus = status || "draft";
    if (!["draft", "active", "out_of_stock", "archived"].includes(finalStatus)) {
      return res.error("Trạng thái sản phẩm không hợp lệ", httpCodes.badRequest);
    }

    // Kiểm tra trùng slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingProduct) {
      return res.error("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
    }

    // Kiểm tra category tồn tại
    if (categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.error("Danh mục sản phẩm không tồn tại", httpCodes.badRequest);
      }
    }

    // Xử lý upload ảnh đại diện qua Cloudinary
    let thumbnailUrl = null;
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0]) {
      thumbnailUrl = req.files["thumbnail"][0].path || req.files["thumbnail"][0].secure_url;
    } else if (req.file) {
      thumbnailUrl = req.file.path || req.file.secure_url;
    }

    // Xử lý upload ảnh con (sub-images)
    const subImages = [];
    if (req.files && req.files["images"]) {
      req.files["images"].forEach((f) => {
        subImages.push(f.path || f.secure_url);
      });
    }

    // Parse metadata
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        parsedMetadata = {};
      }
    }

    // Gán rating mặc định
    if (!parsedMetadata.rating) {
      parsedMetadata.rating = 5.0;
    }

    const product = await prisma.$transaction(async (tx) => {
      // 1. Tạo sản phẩm
      const newProduct = await tx.product.create({
        data: {
          title,
          slug,
          categoryId: categoryId || null,
          productType,
          description: description || "",
          price: parsedPrice,
          currency: currency || "VND",
          status: finalStatus,
          thumbnailUrl,
          metadata: parsedMetadata,
        },
        include: {
          category: true,
          assets: true,
        },
      });

      // 2. Tạo các assets (ảnh con) nếu có
      if (subImages.length > 0) {
        await Promise.all(
          subImages.map((url) =>
            tx.productAsset.create({
              data: {
                productId: newProduct.id,
                assetType: "image",
                fileUrl: url,
              },
            })
          )
        );
      }

      // 3. Ghi Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: "CREATE_PRODUCT",
          targetType: "PRODUCT",
          targetId: newProduct.id,
          description: `Tạo sản phẩm mới "${title}" với giá ${parsedPrice} đ và trạng thái "${finalStatus}".`,
        },
      });

      // Lấy lại thông tin đầy đủ kèm assets
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: true,
          assets: true,
        },
      });
    });

    await emitAdminEvent("admin-products", "product.created", { product });
    if (product.status === "active") {
      await emitAdminEvent("store-feed", "product.created", { product });
    }

    return res.success(product, httpCodes.created, "Tạo sản phẩm mới thành công");
  } catch (err) {
    // Dọn dẹp ảnh đại diện
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0] && req.files["thumbnail"][0].path) {
      await deleteOldImage(req.files["thumbnail"][0].path);
    } else if (req.file && req.file.path) {
      await deleteOldImage(req.file.path);
    }
    // Dọn dẹp ảnh con
    if (req.files && req.files["images"]) {
      for (const f of req.files["images"]) {
        if (f.path) await deleteOldImage(f.path);
      }
    }
    next(err);
  }
};

/**
 * Cập nhật sản phẩm
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      categoryId,
      productType,
      description,
      price,
      currency,
      status,
      metadata,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.error("Sản phẩm không tồn tại", httpCodes.notFound);
    }

    // Validate
    if (title !== undefined && (!title || !title.trim())) {
      return res.error("Tên sản phẩm không được để trống", httpCodes.badRequest);
    }

    if (slug !== undefined) {
      if (!slug || !slug.trim()) {
        return res.error("Đường dẫn (slug) không được để trống", httpCodes.badRequest);
      }
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.error("Đường dẫn chỉ chứa chữ thường không dấu, số và dấu gạch ngang (ví dụ: whey-protein)", httpCodes.badRequest);
      }

      // Check unique slug
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (duplicateProduct) {
        return res.error("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
      }
    }

    if (productType !== undefined && !["supplement", "accessory", "apparel"].includes(productType)) {
      return res.error("Loại sản phẩm không hợp lệ", httpCodes.badRequest);
    }

    let parsedPrice = undefined;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.error("Giá bán phải là số và không được nhỏ hơn 0", httpCodes.badRequest);
      }
    }

    if (status !== undefined && !["draft", "active", "out_of_stock", "archived"].includes(status)) {
      return res.error("Trạng thái sản phẩm không hợp lệ", httpCodes.badRequest);
    }

    if (categoryId !== undefined && categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.error("Danh mục sản phẩm không tồn tại", httpCodes.badRequest);
      }
    }

    // Xử lý upload ảnh đại diện mới
    let thumbnailUrl = undefined;
    let oldThumbnailUrl = existingProduct.thumbnailUrl;

    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0]) {
      thumbnailUrl = req.files["thumbnail"][0].path || req.files["thumbnail"][0].secure_url;
    } else if (req.file) {
      thumbnailUrl = req.file.path || req.file.secure_url;
    }

    // Xử lý upload ảnh con mới (sub-images)
    const subImages = [];
    if (req.files && req.files["images"]) {
      req.files["images"].forEach((f) => {
        subImages.push(f.path || f.secure_url);
      });
    }

    // Xử lý các asset ID cần xóa
    let parsedDeletedAssetIds = [];
    if (req.body.deletedAssetIds) {
      try {
        parsedDeletedAssetIds = typeof req.body.deletedAssetIds === "string"
          ? JSON.parse(req.body.deletedAssetIds)
          : req.body.deletedAssetIds;
      } catch (e) {
        parsedDeletedAssetIds = [];
      }
    }

    // Parse metadata
    let parsedMetadata = undefined;
    if (metadata !== undefined) {
      try {
        parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        parsedMetadata = existingProduct.metadata;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1a. Xóa các assets được yêu cầu xóa
      if (parsedDeletedAssetIds.length > 0) {
        const assetsToDelete = await tx.productAsset.findMany({
          where: {
            id: { in: parsedDeletedAssetIds },
            productId: id,
          },
        });

        await tx.productAsset.deleteMany({
          where: {
            id: { in: parsedDeletedAssetIds },
            productId: id,
          },
        });

        // Xóa trên Cloudinary sau khi giao dịch thành công (sẽ chạy độc lập)
        for (const asset of assetsToDelete) {
          if (asset.fileUrl && isCloudinaryUrl(asset.fileUrl)) {
            deleteOldImage(asset.fileUrl).catch(() => {});
          }
        }
      }

      // 1b. Thêm ảnh con mới
      if (subImages.length > 0) {
        await Promise.all(
          subImages.map((url) =>
            tx.productAsset.create({
              data: {
                productId: id,
                assetType: "image",
                fileUrl: url,
              },
            })
          )
        );
      }

      // 1c. Cập nhật dữ liệu
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          title,
          slug,
          categoryId: categoryId === "" ? null : categoryId,
          productType,
          description,
          price: parsedPrice,
          currency,
          status,
          thumbnailUrl,
          metadata: parsedMetadata,
        },
        include: {
          category: true,
          assets: true,
        },
      });

      // 2. Ghi Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: "UPDATE_PRODUCT",
          targetType: "PRODUCT",
          targetId: id,
          description: `Cập nhật thông tin sản phẩm "${existingProduct.title}" (ID: ${id}).`,
        },
      });

      return updatedProduct;
    });

    // 3. Nếu cập nhật thành công và có ảnh mới, xóa ảnh cũ trên Cloudinary
    if (thumbnailUrl !== undefined && oldThumbnailUrl && isCloudinaryUrl(oldThumbnailUrl)) {
      await deleteOldImage(oldThumbnailUrl);
    }

    await emitAdminEvent("admin-products", "product.updated", { product: updated });
    if (updated.status === "active") {
      await emitAdminEvent("store-feed", "product.updated", { product: updated });
    }

    return res.success(updated, httpCodes.success, "Cập nhật sản phẩm thành công");
  } catch (err) {
    // Dọn dẹp ảnh đại diện mới tải lên nếu lỗi
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0] && req.files["thumbnail"][0].path) {
      await deleteOldImage(req.files["thumbnail"][0].path);
    } else if (req.file && req.file.path) {
      await deleteOldImage(req.file.path);
    }
    // Dọn dẹp ảnh con mới tải lên nếu lỗi
    if (req.files && req.files["images"]) {
      for (const f of req.files["images"]) {
        if (f.path) await deleteOldImage(f.path);
      }
    }
    next(err);
  }
};

/**
 * Đổi trạng thái sản phẩm
 */
const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !["publish", "unpublish", "out_of_stock", "archive", "restore"].includes(action)) {
      return res.error("Hành động thay đổi trạng thái không hợp lệ", httpCodes.badRequest);
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.error("Sản phẩm không tồn tại", httpCodes.notFound);
    }

    // Map hành động sang trạng thái
    let newStatus = product.status;
    let descriptionDetail = "";
    if (action === "publish") {
      newStatus = "active";
      descriptionDetail = `Xuất bản sản phẩm (đang bán) "${product.title}"`;
    } else if (action === "unpublish") {
      newStatus = "draft";
      descriptionDetail = `Chuyển sản phẩm "${product.title}" về Bản nháp`;
    } else if (action === "out_of_stock") {
      newStatus = "out_of_stock";
      descriptionDetail = `Đánh dấu sản phẩm "${product.title}" là Hết hàng`;
    } else if (action === "archive") {
      newStatus = "archived";
      descriptionDetail = `Lưu trữ sản phẩm "${product.title}"`;
    } else if (action === "restore") {
      newStatus = "draft";
      descriptionDetail = `Khôi phục sản phẩm lưu trữ "${product.title}" về Bản nháp`;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { status: newStatus },
        include: {
          category: {
            select: { name: true },
          },
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: "UPDATE_PRODUCT_STATUS",
          targetType: "PRODUCT",
          targetId: id,
          description: descriptionDetail,
        },
      });

      return updatedProduct;
    });

    await emitAdminEvent("admin-products", "product.updated", { product: updated });
    if (updated.status === "active") {
      await emitAdminEvent("store-feed", "product.updated", { product: updated });
    } else {
      await emitAdminEvent("store-feed", "product.deleted", { productId: id });
    }

    return res.success(updated, httpCodes.success, "Đổi trạng thái sản phẩm thành công");
  } catch (err) {
    next(err);
  }
};

/**
 * Xóa sản phẩm an toàn
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        assets: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return res.error("Sản phẩm không tồn tại", httpCodes.notFound);
    }

    // Kiểm tra có đơn hàng chứa sản phẩm này chưa
    if (product._count.orderItems > 0) {
      return res.error(
        "Không thể xóa vĩnh viễn sản phẩm đã có đơn hàng trong hệ thống. Vui lòng chuyển trạng thái sang Đã lưu trữ (Archived) để bảo toàn lịch sử giao dịch.",
        httpCodes.badRequest
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Xóa assets liên quan
      await tx.productAsset.deleteMany({
        where: { productId: id },
      });

      // 2. Xóa sản phẩm khỏi giỏ hàng của người dùng (nếu có)
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      // 3. Xóa sản phẩm
      await tx.product.delete({
        where: { id },
      });

      // 4. Ghi audit log
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: "DELETE_PRODUCT",
          targetType: "PRODUCT",
          targetId: id,
          description: `Xóa vĩnh viễn sản phẩm "${product.title}" (chưa phát sinh đơn hàng).`,
        },
      });
    });

    // 5. Xóa ảnh cũ trên Cloudinary (cả ảnh đại diện và các ảnh con)
    if (product.thumbnailUrl && isCloudinaryUrl(product.thumbnailUrl)) {
      await deleteOldImage(product.thumbnailUrl);
    }

    if (product.assets && product.assets.length > 0) {
      for (const asset of product.assets) {
        if (asset.url && isCloudinaryUrl(asset.url)) {
          await deleteOldImage(asset.url);
        }
      }
    }

    await emitAdminEvent("admin-products", "product.deleted", { productId: id });
    await emitAdminEvent("store-feed", "product.deleted", { productId: id });

    return res.success(null, httpCodes.success, "Xóa sản phẩm thành công");
  } catch (err) {
    next(err);
  }
};

const getProductBrands = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        metadata: true,
      },
    });

    const brands = new Set();
    products.forEach((p) => {
      const brand = p.metadata?.brand;
      if (brand) {
        brands.add(brand);
      }
    });

    return res.success(Array.from(brands).sort(), httpCodes.success, "Lấy danh sách thương hiệu thành công");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getProductBrands,
};
