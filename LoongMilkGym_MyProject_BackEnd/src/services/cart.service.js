const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

/**
 * Tìm hoặc tạo giỏ hàng đang hoạt động (active) cho người dùng
 */
const getOrCreateActiveCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: "active",
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: "active",
      },
    });
  }

  return cart;
};

/**
 * Lấy chi tiết giỏ hàng của người dùng kèm danh sách sản phẩm và tổng tiền
 */
const getCart = async (userId) => {
  const cart = await getOrCreateActiveCart(userId);

  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              thumbnailUrl: true,
              productType: true,
            },
          },
        },
      },
    },
  });

  // Tính toán tổng số lượng và tổng tiền
  let totalQuantity = 0;
  let totalPrice = 0;

  const formattedItems = cartWithItems.items.map((item) => {
    const itemQuantity = item.quantity;
    const itemPrice = Number(item.unitPrice);
    const subtotal = itemPrice * itemQuantity;

    totalQuantity += itemQuantity;
    totalPrice += subtotal;

    return {
      id: item.id,
      productId: item.productId,
      quantity: itemQuantity,
      unitPrice: itemPrice,
      subtotal,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    };
  });

  return {
    id: cartWithItems.id,
    userId: cartWithItems.userId,
    status: cartWithItems.status,
    createdAt: cartWithItems.createdAt,
    updatedAt: cartWithItems.updatedAt,
    items: formattedItems,
    summary: {
      totalQuantity,
      totalPrice,
    },
  };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addItemToCart = async (userId, productId, quantity) => {
  // 1. Kiểm tra sản phẩm tồn tại và đang hoạt động
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.status !== "active") {
    throw new AppError("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.", httpCodes.notFound);
  }

  // 2. Lấy hoặc tạo giỏ hàng active
  const cart = await getOrCreateActiveCart(userId);

  // 3. Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingItem) {
    // Nếu đã có, cộng thêm số lượng
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    // Nếu chưa có, tạo mới
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: product.price, // lưu đơn giá tại thời điểm thêm vào giỏ
      },
    });
  }

  // Trả về giỏ hàng mới cập nhật
  return getCart(userId);
};

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
  // 1. Tìm sản phẩm trong giỏ hàng và kiểm tra quyền sở hữu
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId || cartItem.cart.status !== "active") {
    throw new AppError("Không tìm thấy sản phẩm này trong giỏ hàng của bạn.", httpCodes.notFound);
  }

  // 2. Cập nhật số lượng
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCart(userId);
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 */
const removeItemFromCart = async (userId, cartItemId) => {
  // 1. Tìm sản phẩm trong giỏ hàng và kiểm tra quyền sở hữu
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId || cartItem.cart.status !== "active") {
    throw new AppError("Không tìm thấy sản phẩm này trong giỏ hàng của bạn.", httpCodes.notFound);
  }

  // 2. Thực hiện xóa
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return getCart(userId);
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
};
