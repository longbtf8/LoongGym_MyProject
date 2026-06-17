require("dotenv/config");
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("../generated/prisma");
const cloudinary = require("cloudinary").v2;

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_DIR = path.join(__dirname, "image_v2");

const ensureImageDir = async () => {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
};

const fallbackUrls = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=600",
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600",
  "https://images.unsplash.com/photo-1605296867724-fa87a8ef53fd?q=80&w=600"
];

const downloadImage = async (url, filename, fallbackIndex) => {
  await ensureImageDir();
  let response;
  try {
    response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    const fallbackUrl = fallbackUrls[fallbackIndex % fallbackUrls.length];
    console.log(`[Fallback] Lỗi tải ${url} (${err.message}), chuyển sang fallback: ${fallbackUrl}`);
    response = await fetch(fallbackUrl);
    if (!response.ok) {
      throw new Error(`Không thể tải cả URL fallback: HTTP ${response.status}`);
    }
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const localPath = path.join(IMAGE_DIR, filename);
  await fs.writeFile(localPath, buffer);
  return localPath;
};

const uploadExerciseImage = async (exercise, index) => {
  let localPath = null;
  try {
    localPath = await downloadImage(exercise.thumbnailUrl, `${exercise.slug}.jpg`, index);
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "LoongMilkGym_APP/exercises",
      public_id: exercise.slug,
      overwrite: true,
      resource_type: "image",
    });

    try {
      await fs.unlink(localPath);
    } catch {}

    return result.secure_url;
  } catch (error) {
    console.warn(`[Cảnh báo] Không thể tải/upload ảnh cho bài tập ${exercise.slug} lên Cloudinary:`, error.message);
    if (localPath) {
      try {
        await fs.unlink(localPath);
      } catch {}
    }
    return exercise.thumbnailUrl;
  }
};

const uploadProgramCoverImage = async (program, index) => {
  let localPath = null;
  try {
    localPath = await downloadImage(program.coverImageUrl, `cover_${program.slug}.jpg`, index);
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "LoongMilkGym_APP/program_covers",
      public_id: program.slug,
      overwrite: true,
      resource_type: "image",
    });

    try {
      await fs.unlink(localPath);
    } catch {}

    return result.secure_url;
  } catch (error) {
    console.warn(`[Cảnh báo] Không thể tải/upload ảnh bìa cho giáo án ${program.slug} lên Cloudinary:`, error.message);
    if (localPath) {
      try {
        await fs.unlink(localPath);
      } catch {}
    }
    return program.coverImageUrl;
  }
};

const muscleMapUrls = {
  push: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739559/LoongMilkGym_APP/muscle_maps/push.jpg",
  pull: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739562/LoongMilkGym_APP/muscle_maps/pull.jpg",
  legs: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739565/LoongMilkGym_APP/muscle_maps/legs.jpg",
  core: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739568/LoongMilkGym_APP/muscle_maps/core.jpg",
  arms: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024019/LoongMilkGym_APP/muscle_maps/arms.jpg",
  shoulders: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024668/LoongMilkGym_APP/muscle_maps/shoulders.jpg",
  fullbody: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024672/LoongMilkGym_APP/muscle_maps/fullbody.jpg",
  chest: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024676/LoongMilkGym_APP/muscle_maps/chest.jpg",
  back: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024679/LoongMilkGym_APP/muscle_maps/back.jpg",
};

const exercisesConfig = [
  // --- Chest (Ngực) ---
  {
    name: "Cable Crossover",
    slug: "cable-crossover",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=JUDTGZh4rhg",
    description: "Ép ngực bằng dây cáp giúp cô lập cơ ngực và tạo rãnh ngực sắc nét.",
    equipmentSlug: "cable",
    muscles: [{ slug: "nguc", role: "primary" }],
    tags: ["chest", "cable", "hypertrophy"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Điều chỉnh ròng rọc ở vị trí cao, chọn mức tạ phù hợp. Đứng vào giữa, nắm lấy tay cầm cáp." },
      { stepOrder: 2, title: "Tư thế bắt đầu", instruction: "Bước một chân lên trước để tạo thăng bằng, hơi đổ người về trước, giữ khuỷu tay hơi cong." },
      { stepOrder: 3, title: "Thực hiện ép cáp", instruction: "Dùng lực cơ ngực kéo hai tay lại gần nhau ở trước mặt theo quỹ đạo hình vòng cung." },
      { stepOrder: 4, title: "Trở về tư thế đầu", instruction: "Kiểm soát lực đưa tay từ từ trở lại vị trí ban đầu và lặp lại chuyển động." }
    ],
    commonMistakes: [
      { title: "Sử dụng đà cơ thể", description: "Đổ người hoặc nhún nhảy quá nhiều làm giảm hiệu quả lên cơ ngực.", severity: "medium" },
      { title: "Khóa chặt khớp khuỷu tay", description: "Có thể dẫn đến chấn thương khớp khuỷu tay do chịu lực quá lớn.", severity: "high" }
    ]
  },
  {
    name: "Decline Bench Press",
    slug: "decline-bench-press",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=FFyGwcLnDYc",
    description: "Đẩy tạ đòn trên ghế dốc xuống nhằm tập trung tối đa vào phần ngực dưới.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "nguc", role: "primary" }],
    tags: ["chest", "barbell", "lower-chest"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị tư thế", instruction: "Nằm vững chắc chân khóa vào đệm tựa trên ghế dốc xuống (decline bench). Nắm thanh đòn rộng bằng vai." },
      { stepOrder: 2, title: "Hạ tạ đòn", instruction: "Nhấc tạ ra khỏi giá đỡ, hít vào hạ tạ chậm rãi hướng xuống phần ngực dưới." },
      { stepOrder: 3, title: "Đẩy tạ lên", instruction: "Thở ra dùng lực ngực dưới đẩy tạ thẳng lên trên trở lại vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Để tạ nảy trên ngực", description: "Dùng đà cơ học nảy tạ lên khỏi xương ức gây nguy hiểm cho lồng ngực.", severity: "medium" }
    ]
  },
  {
    name: "Push-Up",
    slug: "push-up",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    description: "Chống đẩy bằng tự trọng cơ thể phát triển cơ ngực, vai và tay sau toàn diện.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "nguc", role: "primary" }, { slug: "tay-sau", role: "secondary" }],
    tags: ["chest", "bodyweight", "basic"],
    steps: [
      { stepOrder: 1, title: "Vào tư thế plank", instruction: "Hai tay chống đất rộng bằng vai, cơ thể tạo thành một đường thẳng từ đầu đến gót chân." },
      { stepOrder: 2, title: "Hạ thấp người", instruction: "Hít vào từ từ hạ khuỷu tay xuống cho đến khi ngực gần chạm sàn." },
      { stepOrder: 3, title: "Đẩy người lên", instruction: "Thở ra nhấn mạnh bàn tay đẩy cơ thể trở lại vị trí xuất phát." }
    ],
    commonMistakes: [
      { title: "Võng lưng dưới", description: "Không siết cơ bụng core khiến hông xệ võng thắt lưng gây đau mỏi lưng dưới.", severity: "high" }
    ]
  },
  {
    name: "Chest Dip",
    slug: "chest-dip",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=35y-0dQc3mE",
    description: "Bài tập chống xà kép dốc người phát triển mạnh mẽ cơ ngực dưới và cơ tam đầu.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "nguc", role: "primary" }, { slug: "tay-sau", role: "secondary" }],
    tags: ["chest", "dips", "bodyweight"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị trên xà", instruction: "Nhấc người đứng trên hai thanh xà song song thẳng tay. Hơi nghiêng nhẹ người về phía trước." },
      { stepOrder: 2, title: "Hạ người xuống", instruction: "Hít vào co khuỷu tay hạ thấp người xuống cho đến khi cánh tay trên song song với mặt sàn." },
      { stepOrder: 3, title: "Đẩy người lên vai", instruction: "Thở ra dùng lực ngực tay sau đẩy người thẳng lên vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Không đổ người về trước", description: "Làm bài tập chuyển hướng sang tay sau hoàn toàn thay vì tác động vào ngực dưới.", severity: "medium" }
    ]
  },
  {
    name: "Pec Deck Machine Fly",
    slug: "pec-deck-machine-fly",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=Z57CtFmRMxA",
    description: "Ép ngực bằng máy cô lập hoàn toàn cơ ngực tránh sự tham gia của tay sau.",
    equipmentSlug: "cable",
    muscles: [{ slug: "nguc", role: "primary" }],
    tags: ["chest", "machine", "isolation"],
    steps: [
      { stepOrder: 1, title: "Ngồi chỉnh ghế", instruction: "Ngồi tựa lưng phẳng vào ghế. Chỉnh chiều cao tay cầm ngang ngực giữa." },
      { stepOrder: 2, title: "Ép ngực", instruction: "Thở ra ép hai tay cầm hướng lại gần nhau trước mặt, siết chặt cơ ngực ở đỉnh 1-2 giây." },
      { stepOrder: 3, title: "Mở rộng tay", instruction: "Hít vào đưa hai tay mở rộng từ từ trở lại vị trí kéo giãn cơ ngực ban đầu." }
    ],
    commonMistakes: [
      { title: "Đẩy vai ra trước", description: "Để bả vai nhô ra ngoài tựa lưng làm mất lực ép của cơ ngực.", severity: "medium" }
    ]
  },

  // --- Back (Lưng) ---
  {
    name: "Barbell Bent-Over Row",
    slug: "barbell-bent-over-row",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=FEFjR70BPt8",
    description: "Gập người kéo tạ đòn - bài tập xây dựng độ dày và độ rộng lưng xô hiệu quả.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "barbell", "strength"],
    steps: [
      { stepOrder: 1, title: "Tư thế chuẩn bị", instruction: "Đứng chân rộng bằng hông, gập người ở khớp hông khoảng 45 độ, lưng giữ thẳng tự nhiên. Nắm thanh đòn rộng hơn vai." },
      { stepOrder: 2, title: "Kéo tạ đòn", instruction: "Thở ra dùng cơ lưng xô kéo thanh đòn chạm nhẹ phần bụng dưới, ép chặt bả vai ra sau." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hít vào nhả tạ từ từ có kiểm soát lực về vị trí duỗi thẳng tay bắt đầu." }
    ],
    commonMistakes: [
      { title: "Gù cong lưng thắt lưng", description: "Gây áp lực cực xấu lên đĩa đệm cột sống lưng gây thoái vị thắt lưng.", severity: "high" }
    ]
  },
  {
    name: "T-Bar Row",
    slug: "t-bar-row",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=j3Igk5nyZE4",
    description: "Kéo tạ đòn chữ T giúp làm dày vùng xô lưng giữa cực tốt.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "barbell", "thickness"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị kéo", instruction: "Đứng dạng hai chân sang hai bên thanh tạ đòn chữ T. Gập nhẹ hông giữ thẳng lưng." },
      { stepOrder: 2, title: "Kéo tạ lên", instruction: "Kéo tay nắm tạ sát lên phía bụng trên ép chặt cơ xô bả vai." },
      { stepOrder: 3, title: "Hạ tạ từ từ", instruction: "Nhả tạ đi xuống duỗi thẳng tay cảm nhận cơ xô giãn căng tối đa." }
    ],
    commonMistakes: [
      { title: "Giật người lấy đà lưng", description: "Nhún nhảy quá nhiều dùng lực đùi mông giật tạ mất đi lực cô lập lưng.", severity: "medium" }
    ]
  },
  {
    name: "Pull-Up",
    slug: "pull-up",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    description: "Hít xà đơn bằng tự trọng - bài tập tốt nhất xây dựng độ rộng lưng cánh chim.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "bodyweight", "lats"],
    steps: [
      { stepOrder: 1, title: "Bám xà đơn rộng", instruction: "Hai tay nắm thanh xà đơn rộng hơn vai hướng lòng bàn tay về phía trước." },
      { stepOrder: 2, title: "Kéo người lên", instruction: "Thở ra kéo ngực lên phía thanh xà mở rộng vai kéo khuỷu tay sát sườn đến khi cằm vượt qua xà." },
      { stepOrder: 3, title: "Hạ người xuống", instruction: "Hít vào duỗi thẳng tay hạ người xuống chậm có kiểm soát." }
    ],
    commonMistakes: [
      { title: "Thả trôi người quá nhanh", description: "Không kiểm soát lực cơ xô khi đi xuống có thể gây chấn thương bả vai khớp vai.", severity: "medium" }
    ]
  },
  {
    name: "Single-Arm Dumbbell Row",
    slug: "single-arm-dumbbell-row",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
    description: "Kéo tạ đơn một bên cô lập từng nửa bên lưng xô khắc phục lệch cơ lưng.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "dumbbell", "unilateral"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị tư thế", instruction: "Đặt một gối và tay cùng bên chống vững trên ghế phẳng. Tay kia cầm quả tạ đơn buông thẳng." },
      { stepOrder: 2, title: "Kéo tạ lên hông", instruction: "Kéo tạ hướng về phía hông, nâng khuỷu tay lên sát sườn, ép chặt bả vai xô." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Từ từ hạ quả tạ về vị trí ban đầu duỗi tay tự nhiên." }
    ],
    commonMistakes: [
      { title: "Xoay thân vặn vai", description: "Làm xoay vẹo thắt lưng giảm độ co bóp tập trung của cơ xô lưng.", severity: "medium" }
    ]
  },
  {
    name: "Face Pull",
    slug: "face-pull",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ljgqer1ZpXg",
    description: "Kéo cáp ngang mặt giúp cải thiện vai sau, lưng trên và tăng độ linh hoạt khớp vai.",
    equipmentSlug: "cable",
    muscles: [{ slug: "vai", role: "primary" }, { slug: "lung", role: "secondary" }],
    tags: ["shoulders", "rear-delt", "cable"],
    steps: [
      { stepOrder: 1, title: "Đứng nắm cáp", instruction: "Chỉnh ròng rọc cáp ngang tầm mắt lắp tay dây thừng. Đứng lùi ra sau nắm dây hai tay hướng vào nhau." },
      { stepOrder: 2, title: "Kéo cáp về mặt", instruction: "Kéo dây thừng về sát trán mở rộng khuỷu tay sang hai bên, xoay ngón cái ra sau ép vai." },
      { stepOrder: 3, title: "Nhả tay trở lại", instruction: "Nhả dây đưa tay trở lại thẳng từ từ có kiểm soát." }
    ],
    commonMistakes: [
      { title: "Kéo khuỷu tay thấp", description: "Làm lệch hướng lực cản không ăn vào cơ vai sau.", severity: "low" }
    ]
  },

  // --- Shoulders (Vai) ---
  {
    name: "Front Dumbbell Raise",
    slug: "front-dumbbell-raise",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=I1BEYlZVp6A",
    description: "Nâng tạ đơn phía trước cô lập phát triển nhóm cơ vai trước tròn đầy.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "vai", role: "primary" }],
    tags: ["shoulders", "dumbbell", "isolation"],
    steps: [
      { stepOrder: 1, title: "Đứng chuẩn bị", instruction: "Đứng thẳng cầm cặp tạ đơn đặt trước đùi lòng bàn tay hướng vào đùi." },
      { stepOrder: 2, title: "Nâng tạ trước mặt", instruction: "Nâng thẳng tay cầm tạ đơn lên trước mặt đến khi ngang tầm mắt, giữ cùi chỏ cong nhẹ." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hạ tạ đơn từ từ xuống vị trí bắt đầu." }
    ],
    commonMistakes: [
      { title: "Vung vẩy giật tạ vai", description: "Dùng đà cơ thể đẩy tạ làm giảm áp lực cô lập vai trước.", severity: "medium" }
    ]
  },
  {
    name: "Rear Delt Fly",
    slug: "rear-delt-fly",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=EA7u4Q_8HQ0",
    description: "Gập người dang tạ đơn cô lập phát triển cơ vai sau khắc phục vai bò xệ vai.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "vai", role: "primary" }],
    tags: ["shoulders", "dumbbell", "rear-delt"],
    steps: [
      { stepOrder: 1, title: "Gập người thẳng lưng", instruction: "Đứng cúi người gập hông sâu lưng song song mặt sàn cầm cặp tạ đơn buông thõng." },
      { stepOrder: 2, title: "Dang tạ đơn", instruction: "Dang hai tay cầm tạ rộng sang hai bên ngang vai nâng vai sau bóp chặt cơ vai sau." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Từ từ khép tay hạ tạ đơn xuống vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Gù lưng trên đầu cổ", description: "Làm giảm tác dụng cơ vai sau và đau cơ cổ gáy.", severity: "medium" }
    ]
  },
  {
    name: "Arnold Press",
    slug: "arnold-press",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=6Z15_WdxmVw",
    description: "Đẩy vai kiểu Arnold xoay cổ tay liên tục tác động toàn diện 3 đầu cơ vai.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "vai", role: "primary" }],
    tags: ["shoulders", "dumbbell", "arnold"],
    steps: [
      { stepOrder: 1, title: "Tư thế ngồi chuẩn bị", instruction: "Ngồi ghế giữ tạ đơn trước ngực lòng bàn tay hướng vào người giống tư thế kết thúc bicep curl." },
      { stepOrder: 2, title: "Đẩy xoay vai", instruction: "Đẩy tạ đơn lên qua đầu đồng thời xoay lòng bàn tay hướng ra phía trước mặt." },
      { stepOrder: 3, title: "Hạ xoay tay", instruction: "Hạ tạ đơn từ từ xoay lòng bàn tay hướng lại vào mặt như ban đầu." }
    ],
    commonMistakes: [
      { title: "Đẩy tạ va đập nhau", description: "Đẩy hai tạ đập vào nhau làm mất thăng bằng rơi tạ nguy hiểm.", severity: "low" }
    ]
  },

  // --- Legs & Glutes (Chân & Mông) ---
  {
    name: "Barbell Hip Thrust",
    slug: "barbell-hip-thrust",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=S_uZP4UH6J0",
    description: "Đẩy hông tạ đòn tựa lưng ghế - bài tập hàng đầu phát triển cơ mông căng tròn săn chắc.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "mong", role: "primary" }, { slug: "dui-sau", role: "secondary" }],
    tags: ["glutes", "barbell", "hip-thrust"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Đặt lưng trên rìa ghế phẳng ngang bả vai. Đặt thanh đòn tạ lên hông (nên có đệm bọc)." },
      { stepOrder: 2, title: "Đẩy hông lên", instruction: "Thở ra đạp gót chân đẩy hông lên cao cho đến khi đùi và thân trên thẳng hàng song song sàn." },
      { stepOrder: 3, title: "Hạ hông", instruction: "Hít vào hạ hông từ từ xuống sát mặt sàn và lặp lại chuyển động." }
    ],
    commonMistakes: [
      { title: "Võng lưng thắt lưng", description: "Nhấc người bằng cơ lưng thay vì ép siết mông đẩy lên gây nhức cột sống lưng.", severity: "high" }
    ]
  },
  {
    name: "Bulgarian Split Squat",
    slug: "bulgarian-split-squat",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=hiLF_pF3EJM",
    description: "Squat một chân tựa ghế dốc sau giúp đùi và mông phát triển cực căng cô lập.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "mong", role: "primary" }, { slug: "dui-truoc", role: "primary" }],
    tags: ["legs", "glutes", "quads", "unilateral"],
    steps: [
      { stepOrder: 1, title: "Tựa một chân sau", instruction: "Đứng quay lưng cách ghế phẳng 1 bước. Đặt mu bàn chân sau lên ghế." },
      { stepOrder: 2, title: "Hạ thấp gối", instruction: "Hạ thấp người xuống cho đến khi đầu gối chân sau gần chạm sàn chân trước vuông góc." },
      { stepOrder: 3, title: "Đẩy người dậy", instruction: "Đạp gót chân trước đẩy người đứng thẳng trở lại." }
    ],
    commonMistakes: [
      { title: "Gối chân trước đổ quá xa mũi chân", description: "Dồn nhiều lực xấu lên khớp gối trước gây đau khớp gối.", severity: "medium" }
    ]
  },
  {
    name: "Glute Bridge",
    slug: "glute-bridge",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
    description: "Nằm cầu mông đẩy hông kích hoạt toàn bộ nhóm cơ mông đơn giản an toàn tại nhà.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "mong", role: "primary" }],
    tags: ["glutes", "bodyweight", "rehab"],
    steps: [
      { stepOrder: 1, title: "Nằm ngửa gập gối", instruction: "Nằm ngửa mặt sàn co gối góc vuông kéo gót chân sát hông. Hai tay đặt phẳng mặt sàn." },
      { stepOrder: 2, title: "Nâng đẩy hông mông", instruction: "Đẩy mạnh gót chân nâng hông thẳng đứng cao tối đa siết cơ mông chặt lại trong 2 giây." },
      { stepOrder: 3, title: "Hạ hông nhẹ", instruction: "Hạ hông từ từ chạm đất nhẹ lặp lại." }
    ],
    commonMistakes: [
      { title: "Đẩy gót chân rời sàn nhấc ngón", description: "Làm lực dồn hết vào bắp chuối đùi trước mất cơ mông.", severity: "low" }
    ]
  },
  {
    name: "Sumo Deadlift",
    slug: "sumo-deadlift",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=9X4E-Iq2VAM",
    description: "Deadlift tư thế sumo đứng chân rộng mở rộng góc hông ăn nhiều vào cơ mông đùi sau đùi trong.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "mong", role: "primary" }, { slug: "dui-sau", role: "primary" }],
    tags: ["glutes", "barbell", "heavy"],
    steps: [
      { stepOrder: 1, title: "Thế chân rộng sumo", instruction: "Đứng chân rất rộng sát bánh tạ mũi chân mở góc 45 độ. Nắm đòn tạ bên trong hai đầu gối thẳng lưng." },
      { stepOrder: 2, title: "Đẩy chân lên", instruction: "Kéo tạ sát ống chân đạp chân mạnh mở gối hướng chân đứng thẳng thẳng hông." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Đẩy hông ra sau hạ tạ từ từ ôm đùi xuống đất." }
    ],
    commonMistakes: [
      { title: "Gối bị sụm chụm vào trong (valgus)", description: "Làm yếu lực chân hông và gây căng đứt dây chằng đầu gối.", severity: "high" }
    ]
  },
  {
    name: "Goblet Squat",
    slug: "goblet-squat",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=gCESNsDsbqk",
    description: "Squat ôm quả tạ trước ngực hỗ trợ giữ thẳng lưng cực tốt cho người mới bắt đầu.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "dui-truoc", role: "primary" }, { slug: "mong", role: "secondary" }],
    tags: ["legs", "dumbbell", "beginners"],
    steps: [
      { stepOrder: 1, title: "Cầm tạ đơn đứng thẳng", instruction: "Hai tay ôm đầu quả tạ đơn áp sát ngực. Chân rộng hơn vai mũi chân hướng ra ngoài." },
      { stepOrder: 2, title: "Squat xuống sâu", instruction: "Đẩy hông ra sau hạ mông ngồi xổm xuống khuỷu tay chạm vào mặt trong đùi giữ thẳng lưng ngực." },
      { stepOrder: 3, title: "Đẩy thẳng người dậy", instruction: "Đạp gót chân đứng thẳng dậy thở ra." }
    ],
    commonMistakes: [
      { title: "Đổ người gập vai lưng", description: "Để tạ kéo rơi người gập vai làm cong vẹo thắt lưng cột sống vai mỏi.", severity: "medium" }
    ]
  },
  {
    name: "Cable Glute Kickback",
    slug: "cable-glute-kickback",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=5jJNfIlKTmg",
    description: "Đá chân sau kéo cáp cô lập phát triển mông trên đầy đặn.",
    equipmentSlug: "cable",
    muscles: [{ slug: "mong", role: "primary" }],
    tags: ["glutes", "cable", "isolation"],
    steps: [
      { stepOrder: 1, title: "Cột cáp vào cổ chân", instruction: "Đeo bao chân cáp vào cổ chân đối diện máy kéo cáp ròng rọc thấp. Đứng cúi nhẹ bám tay chắc." },
      { stepOrder: 2, title: "Đá thẳng chân sau", instruction: "Dùng lực cơ mông đá duỗi thẳng chân đeo tạ ra phía sau cao tối đa siết chặt mông." },
      { stepOrder: 3, title: "Thu chân về", instruction: "Đưa chân thu về từ từ chống chân thẳng ban đầu." }
    ],
    commonMistakes: [
      { title: "Đá gập gối nhún hông", description: "Làm bài tập chuyển sang cơ đùi trước đùi sau thay vì cô lập mông.", severity: "low" }
    ]
  },
  {
    name: "Step-Up",
    slug: "step-up",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQqApCGd5Ss",
    description: "Bước chân lên bục cao phát triển đùi mông thăng bằng một chân.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "dui-truoc", role: "primary" }, { slug: "mong", role: "secondary" }],
    tags: ["legs", "glutes", "unilateral"],
    steps: [
      { stepOrder: 1, title: "Đặt chân lên bục", instruction: "Đứng trước bục sắt cao tầm 30-40cm. Đặt phẳng bàn chân phải lên bục." },
      { stepOrder: 2, title: "Đẩy bước đứng lên", instruction: "Dồn lực chân phải đạp mạnh đứng thẳng người lên bục kéo chân trái đặt cạnh." },
      { stepOrder: 3, title: "Bước lùi xuống", instruction: "Bước lùi chân trái xuống đất nhẹ nhàng rồi thu chân phải lặp lại đổi bên." }
    ],
    commonMistakes: [
      { title: "Đẩy nhún chân dưới đất", description: "Dùng lực nhảy bật của chân dưới mặt đất làm mất đi lực kéo đùi của chân trên bục.", severity: "medium" }
    ]
  },
  {
    name: "Lying Leg Curl",
    slug: "lying-leg-curl",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
    description: "Nằm máy cuốn đùi sau cô lập vùng cơ đùi sau phát triển thon gọn đùi sau chân.",
    equipmentSlug: "cable",
    muscles: [{ slug: "dui-sau", role: "primary" }],
    tags: ["legs", "machine", "hamstrings"],
    steps: [
      { stepOrder: 1, title: "Nằm úp máy tập", instruction: "Nằm úp bụng sát mặt đệm máy tập đặt gót chân dưới đệm mút tạ lăn." },
      { stepOrder: 2, title: "Cuốn gót chân", instruction: "Thở ra cuốn mạnh chân nâng gót sát hông giữ cơ mông ép chặt xuống đệm." },
      { stepOrder: 3, title: "Duỗi chân ra", instruction: "Hít vào duỗi chân từ từ thẳng đều trở lại." }
    ],
    commonMistakes: [
      { title: "Nhấc hông hổng bụng khỏi đệm", description: "Nhấc mông hông lên cao để mượn đà cơ lưng thắt lưng làm mỏi lưng đau lưng.", severity: "medium" }
    ]
  },

  // --- Core (Bụng bụng) ---
  {
    name: "Hanging Leg Raise",
    slug: "hanging-leg-raise",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=Pr1ieGZ5atk",
    description: "Đu xà nâng chân thẳng xây dựng cơ bụng 6 múi cơ bụng dưới siêu khỏe cắt nét.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "core", role: "primary" }],
    tags: ["core", "abs", "hanging"],
    steps: [
      { stepOrder: 1, title: "Đu treo người trên xà", instruction: "Hai tay bám xà đơn treo người thẳng đứng vai gáy thoải mái thả chân thẳng." },
      { stepOrder: 2, title: "Nâng cao chân", instruction: "Gồng bụng dưới nâng hai chân thẳng lên trước mặt song song sàn nhà (hoặc co gối nhẹ)." },
      { stepOrder: 3, title: "Hạ chân chậm", instruction: "Hạ chân từ từ thẳng xuống tránh để đu đưa đà cơ thể." }
    ],
    commonMistakes: [
      { title: "Đung đưa lấy đà", description: "Thân người đung đưa trước sau quá nhiều làm mất đi lực ép cuộn bụng dưới.", severity: "medium" }
    ]
  },
  {
    name: "Russian Twist",
    slug: "russian-twist",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI",
    description: "Xoay người kiểu Nga gồng cơ bụng săn gọn phần eo liên sườn.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "core", role: "primary" }],
    tags: ["core", "abs", "obliques"],
    steps: [
      { stepOrder: 1, title: "Ngồi chéo chân nhấc sàn", instruction: "Ngồi trên sàn hơi ngả lưng sau gập gối nhấc nhẹ hai bàn chân khỏi sàn giữ thăng bằng trên mông." },
      { stepOrder: 2, title: "Xoay người liên sườn", instruction: "Xoay chéo toàn bộ thân vai ngực sang bên phải rồi tiếp tục xoay vặn mạnh sang trái luân phiên." }
    ],
    commonMistakes: [
      { title: "Chỉ chuyển động cánh tay", description: "Chỉ xoay vung hai tay qua lại thay vì xoay thực sự bả vai cơ liên sườn bụng bụng.", severity: "low" }
    ]
  },
  {
    name: "Cable Woodchop",
    slug: "cable-woodchop",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://cdn.prod.website-files.com/622a2493e852641b8fd6d827/6567c1e19ab4d69719021425_64e7562753fd9f0031639adf_64d38aa7aa1fb302c7c33166_Screenshot%2525202023-08-09%252520at%25252015.45.29.avif",
    videoUrl: "https://www.youtube.com/watch?v=pAplQXk3dkU",
    description: "Kéo cáp chéo từ trên xuống xoay eo giống động tác chặt củi tăng sức mạnh xoay vai lõi bụng.",
    equipmentSlug: "cable",
    muscles: [{ slug: "core", role: "primary" }],
    tags: ["core", "obliques", "rotational"],
    steps: [
      { stepOrder: 1, title: "Đứng nghiêng kéo cáp", instruction: "Đứng nghiêng cạnh máy cáp ròng rọc cao cầm tay nắm. Chân rộng bằng vai." },
      { stepOrder: 2, title: "Chặt chéo từ trên xuống", instruction: "Xoay người kéo cáp chéo từ trên cao đi xuống đùi đối diện gồng cơ liên sườn eo bụng xoay vai." },
      { stepOrder: 3, title: "Nhả cáp lên chậm", instruction: "Đưa cáp thả lên từ từ xoay người trở lại." }
    ],
    commonMistakes: [
      { title: "Dùng lực tay kéo giật", description: "Cánh tay phải giữ thẳng cố định, lực xoay kéo hoàn toàn từ lõi bụng xoay hông.", severity: "medium" }
    ]
  },
  {
    name: "Ab Wheel Rollout",
    slug: "ab-wheel-rollout",
    difficulty: "advanced",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=rqiTPdK1c_I",
    description: "Lăn bánh xe tập bụng - bài tập hủy diệt bụng core độ khó cao.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "core", role: "primary" }],
    tags: ["core", "abs", "advanced"],
    steps: [
      { stepOrder: 1, title: "Quỳ gối cầm con lăn", instruction: "Quỳ gối trên đệm thảm hai tay nắm hai bên trục bánh xe con lăn bụng đặt thẳng dưới vai." },
      { stepOrder: 2, title: "Lăn bánh xe đi trước", instruction: "Từ từ đẩy lăn con lăn thẳng ra phía trước giữ thắt lưng cong cuộn nhẹ cơ bụng căng hết người." },
      { stepOrder: 3, title: "Thu con lăn về", instruction: "Dùng cơ bụng cuộn thu con lăn kéo người trở lại vị trí quỳ gối ban đầu." }
    ],
    commonMistakes: [
      { title: "Võng sụm lưng dưới thắt lưng", description: "Hạ sệ thắt lưng xuống đất khi duỗi lăn gây áp lực gẫy cột sống đau lưng dưới.", severity: "high" }
    ]
  },

  // --- Cardio & HIIT (Tim mạch đốt mỡ) ---
  {
    name: "Burpee",
    slug: "burpee",
    difficulty: "intermediate",
    exerciseType: "hiit",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
    videoUrl: "https://www.youtube.com/watch?v=qLBImHhCXSw",
    description: "Tổ hợp bật nhảy chống đẩy liên tục bốc lửa đốt mỡ toàn thân thể lực tim mạch bùng nổ.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "toan-than", role: "primary" }, { slug: "core", role: "secondary" }],
    tags: ["hiit", "cardio", "fatburn"],
    steps: [
      { stepOrder: 1, title: "Ngồi xổm chống tay", instruction: "Đứng thẳng rồi ngồi xổm xuống chống hai bàn tay phẳng mặt sàn." },
      { stepOrder: 2, title: "Bật chân sau chống đẩy", instruction: "Bật mạnh hai chân ra sau vào tư thế plank rồi hạ ngực chạm sàn chống đẩy." },
      { stepOrder: 3, title: "Thu chân bật nhảy", instruction: "Bật chân thu về tư thế ngồi xổm rồi đạp nhảy cao lên trần giơ thẳng hai tay qua đầu." }
    ],
    commonMistakes: [
      { title: "Tiếp đất chân thẳng đơ", description: "Làm phản chấn lực va chạm mạnh lên đầu gối mắt cá chân chấn thương.", severity: "high" }
    ]
  },
  {
    name: "Jump Squat",
    slug: "jump-squat",
    difficulty: "beginner",
    exerciseType: "hiit",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Freehand_Jump_Squat/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=5qqAUsHmAMU",
    description: "Squat bật nhảy bùng nổ sức mạnh cổ chân gối đùi săn chắc chân.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "dui-truoc", role: "primary" }, { slug: "mong", role: "secondary" }],
    tags: ["hiit", "legs", "plyometrics"],
    steps: [
      { stepOrder: 1, title: "Hạ squat chuẩn bị", instruction: "Chân rộng bằng vai hạ người squat song song mông hông thẳng ngực." },
      { stepOrder: 2, title: "Bật nhảy cao", instruction: "Đạp mạnh chân phóng bùng nổ đẩy người bật nhảy cao khỏi mặt đất thẳng chân." },
      { stepOrder: 3, title: "Tiếp đất chùng gối", instruction: "Tiếp đất nhẹ mũi bàn chân chùng gối hạ mông lập tức giảm chấn lặp lại." }
    ],
    commonMistakes: [
      { title: "Đổ sụm gối chụm gối", description: "Gối bị quắp gập vào nhau khi tiếp đất gây hại khớp chè gối.", severity: "high" }
    ]
  },
  {
    name: "Battle Rope Slam",
    slug: "battle-rope-slam",
    difficulty: "beginner",
    exerciseType: "cardio",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Battling_Ropes/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=1g2q8hP1f5A",
    description: "Quật dây thừng thể lực đốt calo mỏi nhừ tay vai xô bụng đùi.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "toan-than", role: "primary" }, { slug: "core", role: "secondary" }],
    tags: ["cardio", "hiit", "conditioning"],
    steps: [
      { stepOrder: 1, title: "Tư thế đứng tấn", instruction: "Đứng tấn thấp gối hông mở rộng chân. Hai tay cầm hai đầu dây thừng." },
      { stepOrder: 2, title: "Quật dây bùng nổ", instruction: "Vung hai tay nhấc dây thừng lên cao qua đầu rồi dập mạnh quật dây xuống đất tạo sóng dây liên tục." }
    ],
    commonMistakes: [
      { title: "Đứng thẳng người gù vai", description: "Làm mỏi cổ thắt lưng do không dùng tấn hông đùi bộc phát lực cánh tay.", severity: "medium" }
    ]
  },
  {
    name: "Clean and Press",
    slug: "clean-and-press",
    difficulty: "advanced",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=KCe8l86-alA",
    description: "Clean tạ lên vai rồi đẩy thẳng qua đầu - bài tập phối hợp Olympic đỉnh cao sức mạnh.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "toan-than", role: "primary" }, { slug: "vai", role: "secondary" }],
    tags: ["compound", "barbell", "olympic"],
    steps: [
      { stepOrder: 1, title: "Tư thế chuẩn bị deadlift", instruction: "Đứng cúi người cầm tạ đòn thẳng lưng thắt chặt bụng." },
      { stepOrder: 2, title: "Clean lên vai", instruction: "Đẩy chân vung hông kéo tạ đòn vọt nhanh lên đón tạ bằng mặt trước vai cùi chỏ hướng trước." },
      { stepOrder: 3, title: "Press đẩy qua đầu", instruction: "Đẩy thẳng tạ đòn qua đầu khóa vai đứng thẳng người dứt khoát." },
      { stepOrder: 4, title: "Hạ tạ", instruction: "Từ từ hạ tạ về vai rồi hạ xuống đất an toàn." }
    ],
    commonMistakes: [
      { title: "Dùng lực bắp tay giật tạ", description: "Clean đòi hỏi dùng sức bật đẩy của hông chân tạo quán tính quăng tạ lên vai.", severity: "high" }
    ]
  },
  {
    name: "Kettlebell Swing",
    slug: "kettlebell-swing",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=bDCeXbMJVNs",
    description: "Vung quả tạ ấm tập trung sức mạnh chuyển động bản lề hông đùi sau mông.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "mong", role: "primary" }, { slug: "dui-sau", role: "primary" }],
    tags: ["glutes", "kettlebell", "power"],
    steps: [
      { stepOrder: 1, title: "Tư thế bắt đầu", instruction: "Đứng chân rộng hơn vai. Đặt tạ ấm trước mặt, cúi người cầm tạ kéo nhẹ ra sau giữa hai chân." },
      { stepOrder: 2, title: "Đẩy hông vung tạ", instruction: "Đẩy mạnh khớp hông về phía trước bùng nổ đẩy quả tạ ấm vung thẳng lên ngang tầm ngực." },
      { stepOrder: 3, title: "Hạ tạ bản lề hông", instruction: "Để tạ rơi tự do chui qua hai chân đồng thời gập hông ra sau đón tạ chuẩn bị rep tiếp." }
    ],
    commonMistakes: [
      { title: "Squat thay vì bản lề hông (hinge)", description: "Co đầu gối quá nhiều thành squat làm mất áp lực cơ mông đùi sau.", severity: "medium" },
      { title: "Dùng tay nhấc tạ", description: "Lực vung tạ hoàn toàn từ hông đùi mông phóng ra, tay chỉ giữ tạ.", severity: "medium" }
    ]
  },
  {
    name: "Farmer's Walk",
    slug: "farmers-walk",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=NH7Xv-7NQNQ",
    description: "Xách hai tạ đi bộ quãng đường dài xây dựng lực nắm tay vai cầu vai bụng cực khỏe.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "toan-than", role: "primary" }, { slug: "core", role: "secondary" }],
    tags: ["core", "grip-strength", "conditioning"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị xách tạ", instruction: "Cúi nhấc hai quả tạ đơn nặng hai bên đứng thẳng người lên chắc chắn." },
      { stepOrder: 2, title: "Đi bộ thẳng tiến", instruction: "Siết chặt bụng giữ vai cân đối thẳng lưng đi từng bước nhỏ dứt khoát về phía trước." }
    ],
    commonMistakes: [
      { title: "Gù vai rụt cổ", description: "Gây mỏi cổ chấn thương khớp bả vai cột sống cổ.", severity: "medium" }
    ]
  },

  // --- Basic Compounds ---
  {
    name: "Bench Press",
    slug: "bench-press",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    description: "Nằm đẩy tạ đòn trên ghế phẳng - bài tập kinh điển phát triển ngực.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "nguc", role: "primary" }, { slug: "tay-sau", role: "secondary" }],
    tags: ["chest", "barbell", "bench-press"],
    steps: [
      { stepOrder: 1, title: "Set up", instruction: "Nằm phẳng trên ghế, mắt thẳng dưới thanh đòn. Nắm thanh đòn rộng hơn vai." },
      { stepOrder: 2, title: "Hạ tạ", instruction: "Hít vào hạ tạ chậm rãi xuống sát ngực giữa." },
      { stepOrder: 3, title: "Đẩy tạ", instruction: "Thở ra dùng lực ngực đẩy tạ thẳng lên về vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Nhấc vai khỏi ghế", description: "Làm mất sự vững chãi của vai khớp gánh lực.", severity: "high" }
    ]
  },
  {
    name: "Incline Dumbbell Press",
    slug: "incline-dumbbell-press",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    description: "Nằm đẩy tạ đơn trên ghế dốc lên xây dựng cơ ngực trên săn chắc dày dặn.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "nguc", role: "primary" }],
    tags: ["chest", "dumbbell", "upper-chest"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Ngồi ghế dốc lên khoảng 30-45 độ. Hai tay cầm tạ đặt trên đùi rồi ngửa lưng tựa ghế đá tạ lên vai." },
      { stepOrder: 2, title: "Đẩy tạ", instruction: "Đẩy tạ đơn thẳng lên trần nhà đồng thời khép dần hai quả tạ gần nhau ở đỉnh." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hạ tạ đơn từ từ xuống hai bên ngực mở rộng cơ ngực tối đa." }
    ],
    commonMistakes: [
      { title: "Góc dốc ghế quá cao", description: "Dốc trên 45 độ làm áp lực chuyển sang cơ vai trước nhiều hơn ngực.", severity: "medium" }
    ]
  },
  {
    name: "Dumbbell Flyes",
    slug: "dumbbell-flyes",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=QENKPHhQVi4",
    description: "Bài dang tạ đơn trên ghế phẳng mở rộng xé cơ ngực rộng tối đa.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "nguc", role: "primary" }],
    tags: ["chest", "dumbbell", "isolation"],
    steps: [
      { stepOrder: 1, title: "Bắt đầu", instruction: "Nằm phẳng trên ghế tập, đẩy hai quả tạ đơn thẳng đứng phía trước ngực." },
      { stepOrder: 2, title: "Mở rộng tay", instruction: "Hạ tạ từ từ mở rộng hai tay sang hai bên hình cánh quạt, giữ khuỷu tay cong nhẹ định hình." },
      { stepOrder: 3, title: "Khép ngực", instruction: "Ép cơ ngực kéo hai quả tạ trở lại vị trí ép ban đầu." }
    ],
    commonMistakes: [
      { title: "Khóa thẳng cánh tay", description: "Làm mỏi khớp khuỷu tay và nguy cơ chấn thương cùi chỏ bả vai.", severity: "high" }
    ]
  },
  {
    name: "Shoulder Press",
    slug: "shoulder-press",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    description: "Đẩy tạ đơn thẳng đứng qua đầu giúp phát triển cơ vai to khỏe rộng.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "vai", role: "primary" }],
    tags: ["shoulders", "dumbbell", "press"],
    steps: [
      { stepOrder: 1, title: "Tư thế ngồi đẩy", instruction: "Ngồi thẳng lưng trên ghế phẳng tựa lưng. Giữ tạ đơn hai bên tai khuỷu tay góc 90 độ." },
      { stepOrder: 2, title: "Đẩy tạ", instruction: "Thở ra dùng lực vai đẩy hai quả tạ thẳng lên trần nhà tiến sát nhau nhưng không chạm." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hít vào hạ tạ từ từ có kiểm soát lực trở lại vị trí tai ban đầu." }
    ],
    commonMistakes: [
      { title: "Võng lưng dưới rời khỏi tựa ghế", description: "Gây đau thắt lưng do dồn trọng lượng tạ đè sai trục cột sống.", severity: "high" }
    ]
  },
  {
    name: "Lateral Raise",
    slug: "lateral-raise",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    description: "Dang tạ đơn sang hai bên giúp phát triển vai giữa nở rộng hình quả táo.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "vai", role: "primary" }],
    tags: ["shoulders", "dumbbell", "lateral-raise"],
    steps: [
      { stepOrder: 1, title: "Tư thế chuẩn bị", instruction: "Đứng thẳng người cầm tạ hai bên hông. Hơi đổ người nhẹ về trước." },
      { stepOrder: 2, title: "Dang tay vai", instruction: "Nâng hai tay cầm tạ sang hai bên rộng mở đến khi ngang vai, hướng ngón út hơi xoay lên trên." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hạ tạ nhẹ nhàng từ từ về vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Dùng đà cơ thể giật tạ", description: "Khiến bài tập mất hoàn toàn áp lực cô lập cơ vai giữa.", severity: "medium" }
    ]
  },
  {
    name: "Deadlift",
    slug: "deadlift",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=XxWcirHIwVo",
    description: "Vua của các bài tập toàn thân giúp phát triển sức mạnh bộc phát toàn cơ thể lưng mông chân.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "lung", role: "primary" }, { slug: "mong", role: "primary" }],
    tags: ["back", "legs", "compound", "powerlifting"],
    steps: [
      { stepOrder: 1, title: "Set up thế đứng", instruction: "Đứng giữa thanh đòn tạ đặt sát cẳng chân. Nắm tạ rộng bằng vai nằm ngoài gối." },
      { stepOrder: 2, title: "Khóa tư thế", instruction: "Hạ hông xuống thẳng lưng, ngực ngẩng cao, siết cơ xô khóa chặt thắt lưng." },
      { stepOrder: 3, title: "Kéo nhấc tạ", instruction: "Đẩy chân đạp đất kéo thanh đòn thẳng lên áp sát chân cho tới khi đứng thẳng hoàn toàn." },
      { stepOrder: 4, title: "Hạ tạ xuống", instruction: "Đẩy hông ra sau hạ tạ từ từ có kiểm soát về vị trí bắt đầu dưới sàn." }
    ],
    commonMistakes: [
      { title: "Gù cong cột sống lưng", description: "Lỗi đặc biệt nguy hiểm gây thoái vị đĩa đệm lập tức khi nâng tạ nặng.", severity: "high" }
    ]
  },
  {
    name: "Lat Pulldown",
    slug: "lat-pulldown",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    description: "Kéo cáp xô trên máy ngồi kéo phát triển chiều rộng lưng cánh chim xô.",
    equipmentSlug: "cable",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "lats", "pulldown"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị ngồi kéo", instruction: "Ngồi vào máy tập chỉnh đệm gối ép chặt đùi. Hai tay bám thanh đòn rộng." },
      { stepOrder: 2, title: "Kéo cáp xô", instruction: "Thở ra kéo thanh đòn xuống sát phần ngực trên, hơi ngả lưng nhẹ ra sau vươn ngực đón thanh đòn." },
      { stepOrder: 3, title: "Trả thanh đòn", instruction: "Hít vào đưa thanh đòn thả lên từ từ giãn toàn bộ cơ xô lưng." }
    ],
    commonMistakes: [
      { title: "Giật kéo tạ quá đà ngả lưng sâu", description: "Làm mất lực kéo cô lập của cơ xô cánh chim.", severity: "medium" }
    ]
  },
  {
    name: "Dumbbell Row",
    slug: "dumbbell-row",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=gfUg6qWohTk",
    description: "Kéo tạ đơn từng tay một hỗ trợ cô lập cơ lưng xô.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "dumbbell", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị tư thế", instruction: "Chống tay gối lên ghế thẳng. Tay xách tạ đơn thõng tự nhiên hướng sàn." },
      { stepOrder: 2, title: "Kéo tạ sát hông", instruction: "Dùng lực cơ lưng kéo quả tạ sát lên dọc hông, ép khuỷu tay sát sườn." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Từ từ hạ tạ đơn xuống thẳng tay thư giãn cơ lưng xô." }
    ],
    commonMistakes: [
      { title: "Vặn vai quá mức", description: "Làm xoay vẹo cột sống giảm tác động thẳng vào cơ xô lưng.", severity: "medium" }
    ]
  },
  {
    name: "Seated Cable Row",
    slug: "seated-cable-row",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=GZbfZ033f74",
    description: "Ngồi kéo cáp lưng giữa giúp làm dày rãnh lưng.",
    equipmentSlug: "cable",
    muscles: [{ slug: "lung", role: "primary" }],
    tags: ["back", "cable", "mid-back"],
    steps: [
      { stepOrder: 1, title: "Tư thế ngồi kéo", instruction: "Ngồi vào máy đạp chân chắc chắn gối hơi chùng nhẹ lưng thẳng đứng nắm tay cáp chữ V." },
      { stepOrder: 2, title: "Kéo tay cáp", instruction: "Kéo tay nắm cáp về sát phần rốn thắt lưng ép chặt bả vai ra sau vươn ngực thẳng lưng." },
      { stepOrder: 3, title: "Nhả cáp xô", instruction: "Từ từ nhả tay duỗi cáp thẳng ra phía trước đầu gối chùng nhẹ." }
    ],
    commonMistakes: [
      { title: "Đổ rạp giật người lấy đà", description: "Gây mỏi cơ thắt lưng và mất kiểm soát độ cô lập lưng giữa.", severity: "medium" }
    ]
  },
  {
    name: "Barbell Squat",
    slug: "barbell-squat",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=gcNh17Ckjgg",
    description: "Vua gánh tạ đòn phát triển đùi mông săn chắc mạnh mẽ hàng đầu.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "dui-truoc", role: "primary" }, { slug: "mong", role: "primary" }],
    tags: ["legs", "squat", "barbell", "quads"],
    steps: [
      { stepOrder: 1, title: "Gánh tạ đòn lên vai", instruction: "Gánh thanh đòn tựa vững trên cơ cầu vai lưng trên. Bước lùi ra khỏi giá chân rộng hơn vai mũi chân mở nhẹ." },
      { stepOrder: 2, title: "Hạ squat sâu", instruction: "Hít vào đẩy hông ra sau hạ mông sâu xuống dưới song song mặt đệm gối mở rộng theo hướng chân." },
      { stepOrder: 3, title: "Đẩy thẳng người dậy", instruction: "Thở ra đạp mạnh gót bàn chân đẩy người đứng thẳng dậy siết mông." }
    ],
    commonMistakes: [
      { title: "Gối chụm gập vào nhau (valgus)", description: "Gây chấn thương đứt dây chằng chéo gối vô cùng nguy hiểm.", severity: "high" },
      { title: "Gù cong lưng thắt lưng", description: "Làm sụm lún đĩa đệm cột sống lưng khi gánh tạ đè nặng.", severity: "high" }
    ]
  },
  {
    name: "Leg Press",
    slug: "leg-press",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=K5n2vg3oZa4",
    description: "Đạp đùi trên máy dốc nghiêng phát triển đùi trước an toàn khớp lưng.",
    equipmentSlug: "cable",
    muscles: [{ slug: "dui-truoc", role: "primary" }],
    tags: ["legs", "machine", "quads"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Ngồi máy đạp đặt hai bàn chân trên bàn đạp sắt rộng bằng vai tháo khóa chốt tạ an toàn." },
      { stepOrder: 2, title: "Hạ đùi gối", instruction: "Hạ tạ từ từ co gối về sát phía ngực bụng." },
      { stepOrder: 3, title: "Đạp tạ đẩy lên", instruction: "Đạp mạnh chân đẩy bàn đạp sắt lên cao giữ đầu gối hơi chùng nhẹ không khóa khớp." }
    ],
    commonMistakes: [
      { title: "Khóa thẳng đơ đầu gối ở đỉnh", description: "Cực kỳ nguy hiểm có thể làm gập ngược khớp gối gãy xương đùi dưới sức ép tạ.", severity: "high" }
    ]
  },
  {
    name: "Romanian Deadlift",
    slug: "romanian-deadlift",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
    description: "Deadlift kiểu RDL đẩy hông tối đa kéo căng phát triển săn chắc đùi sau mông.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "dui-sau", role: "primary" }, { slug: "mong", role: "secondary" }],
    tags: ["legs", "hamstrings", "romanian-deadlift"],
    steps: [
      { stepOrder: 1, title: "Đứng thẳng tạ", instruction: "Đứng thẳng nắm thanh đòn sát đùi. Chân rộng bằng hông." },
      { stepOrder: 2, title: "Đẩy hông bản lề", instruction: "Hạ thanh đòn sát chân đồng thời đẩy hông tối đa ra sau đầu gối chỉ chùng nhẹ không hạ squat giữ lưng thẳng." },
      { stepOrder: 3, title: "Đứng lên", instruction: "Kéo tạ thẳng lên siết chặt cơ mông đùi sau khi đứng thẳng." }
    ],
    commonMistakes: [
      { title: "Cong thắt lưng", description: "Làm tổn thương cột sống lưng dưới do không khóa core thắt lưng.", severity: "high" }
    ]
  },
  {
    name: "Walking Lunges",
    slug: "walking-lunges",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=vYfp2t4XgqQ",
    description: "Bước đi gập gối luân phiên tăng cường sức bền đùi mông săn chắc.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "dui-truoc", role: "primary" }, { slug: "mong", role: "secondary" }],
    tags: ["legs", "lunges", "conditioning"],
    steps: [
      { stepOrder: 1, title: "Bước lên gập gối", instruction: "Đứng thẳng cầm tạ đơn hai bên bước chân dài lên trước hạ thấp người gối sau gần chạm sàn gối trước góc vuông." },
      { stepOrder: 2, title: "Bước tiếp", instruction: "Đẩy chân trước đứng lên bước tiếp chân sau lên làm tương tự đổi chân liên tục đi về trước." }
    ],
    commonMistakes: [
      { title: "Bước khoảng cách chân quá ngắn", description: "Làm gối trước đổ nhô quá xa mũi chân gây áp lực gối đầu gối gập khớp đau.", severity: "medium" }
    ]
  },
  {
    name: "Calf Raise",
    slug: "calf-raise",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=k8ipHzKeAkQ",
    description: "Nhón bắp chân giúp săn chắc phần cơ bắp chân thon gọn.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "bap-chan", role: "primary" }],
    tags: ["legs", "calves", "bodyweight"],
    steps: [
      { stepOrder: 1, title: "Đứng thẳng nhón", instruction: "Đứng thẳng trên mặt sàn nhón hai gót chân lên cao tối đa siết cơ bắp chân ở đỉnh." },
      { stepOrder: 2, title: "Hạ xuống", instruction: "Hạ gót chân chạm sàn nhẹ nhàng từ từ lặp lại." }
    ],
    commonMistakes: [
      { title: "Nhún nhảy quá nhanh", description: "Dùng cơ gân gót Achilles đàn hồi giật lên thay vì siết cơ bắp chân thực sự.", severity: "low" }
    ]
  },
  {
    name: "Plank",
    slug: "plank",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    description: "Bài tập giữ người thẳng bằng khuỷu tay xây dựng cơ bụng core siêu khỏe.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "core", role: "primary" }],
    tags: ["core", "abs", "isometric"],
    steps: [
      { stepOrder: 1, title: "Tư thế plank", instruction: "Chống hai khuỷu tay vuông góc dưới vai tạo người thành một đường thẳng từ đầu đến gót chân." },
      { stepOrder: 2, title: "Giữ tư thế", instruction: "Siết chặt bụng mông đùi giữ tư thế thở đều đặn tránh hạ hông võng lưng thắt lưng." }
    ],
    commonMistakes: [
      { title: "Hạ thấp hông võng lưng thắt lưng", description: "Dồn trọng lượng xệ thắt lưng gây đau mỏi lưng dưới trầm trọng.", severity: "high" }
    ]
  },
  {
    name: "Mountain Climber",
    slug: "mountain-climber",
    difficulty: "beginner",
    exerciseType: "cardio",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
    description: "Tư thế chống đẩy chạy bộ liên tục leo núi đốt mỡ bụng tim mạch khỏe.",
    equipmentSlug: "bodyweight",
    muscles: [{ slug: "core", role: "primary" }, { slug: "toan-than", role: "secondary" }],
    tags: ["cardio", "hiit", "core"],
    steps: [
      { stepOrder: 1, title: "Chống tay leo núi", instruction: "Tư thế plank chống tay cao. Co đầu gối phải lên ngực rồi thu về đổi chân trái lên nhanh luân phiên giống chạy bộ." }
    ],
    commonMistakes: [
      { title: "Nâng mông nhô quá cao", description: "Làm mất áp lực siết cơ bụng core xô tay vai.", severity: "medium" }
    ]
  },

  // --- 6 Arm Exercises from roadmap config ---
  {
    name: "Barbell Bicep Curl",
    slug: "barbell-bicep-curl",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=9BpYNH4nb_Q",
    description: "Xây dựng kích thước tổng thể cho tay trước bằng tạ đòn.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Đứng thẳng người cầm thanh tạ đòn rộng bằng vai, lòng bàn tay hướng ra ngoài." },
      { stepOrder: 2, title: "Cuốn tạ", instruction: "Giữ chặt cùi chỏ sát bên hông và dùng lực cơ tay trước cuốn tạ lên trên." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Từ từ hạ tạ có kiểm soát trở lại vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Vung vẩy lưng lấy đà", description: "Làm giảm áp lực lên cơ tay trước và tăng nguy cơ chấn thương thắt lưng.", severity: "medium" }
    ]
  },
  {
    name: "Hammer Curl",
    slug: "hammer-curl",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=BRVDS6HVR9Q",
    description: "Tập trung vào cơ brachialis giúp tay trông dày hơn.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "brachialis", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Đứng thẳng người cầm cặp tạ đơn hai bên hông, lòng bàn tay hướng vào nhau." },
      { stepOrder: 2, title: "Cuốn tạ", instruction: "Cuốn tạ đơn lên phía trước giữ nguyên lòng bàn tay hướng vào nhau như cầm búa." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hạ tạ chậm rãi có kiểm soát về vị trí bắt đầu." }
    ],
    commonMistakes: [
      { title: "Đưa cùi chỏ ra trước", description: "Làm mất áp lực cô lập lên phần cơ bắp tay trước.", severity: "low" }
    ]
  },
  {
    name: "Incline Dumbbell Curl",
    slug: "incline-dumbbell-curl",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=DCe8f6vMe9A",
    description: "Kéo căng cơ tay trước tối đa ở tư thế nằm nghiêng.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Nằm ngửa lưng tựa trên ghế dốc nghiêng khoảng 45 độ, hai tay buông thõng cầm tạ đơn." },
      { stepOrder: 2, title: "Cuốn tạ", instruction: "Giữ hai cùi chỏ cố định hướng thẳng xuống sàn, cuốn hai tạ đơn lên cao." },
      { stepOrder: 3, title: "Hạ tạ", instruction: "Hạ tạ chậm rãi có kiểm soát cảm nhận cơ tay trước giãn căng." }
    ],
    commonMistakes: [
      { title: "Đẩy cùi chỏ ra sau quá nhiều", description: "Làm mất độ kéo căng tự nhiên của cơ đầu dài tay trước.", severity: "medium" }
    ]
  },
  {
    name: "Tricep Rope Pushdown",
    slug: "tricep-rope-pushdown",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=vB5OHsJ3EME",
    description: "Bài tập cáp an toàn và hiệu quả cho tay sau.",
    equipmentSlug: "cable",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Đứng đối diện máy kéo cáp ròng rọc cao cầm tay nắm dây thừng." },
      { stepOrder: 2, title: "Nhấn cáp xuống", instruction: "Khóa cùi chỏ sát sườn, nhấn mạnh dây thừng đi xuống thẳng tay mở hai đầu dây sang hai bên đùi." },
      { stepOrder: 3, title: "Nhả tay", instruction: "Đưa tay co lên từ từ cảm nhận lực cản của cáp." }
    ],
    commonMistakes: [
      { title: "Mở cùi chỏ rộng sang hai bên", description: "Làm giảm lực ăn vào cơ tam đầu tay sau.", severity: "medium" }
    ]
  },
  {
    name: "Skull Crushers",
    slug: "skull-crushers",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
    description: "Phát triển sức mạnh và độ dày tay sau.",
    equipmentSlug: "ez-bar",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Nằm ngửa lưng phẳng ghế cầm thanh tạ EZ giơ thẳng đứng trước ngực." },
      { stepOrder: 2, title: "Hạ tạ", instruction: "Khóa chặt bắp tay trên, hạ khuỷu tay đưa thanh tạ EZ về phía sát trán." },
      { stepOrder: 3, title: "Đẩy tạ lên", instruction: "Dùng lực cơ tay sau đẩy thanh tạ EZ thẳng đứng trở lại vị trí ban đầu." }
    ],
    commonMistakes: [
      { title: "Vung vẩy khuỷu tay trước sau", description: "Làm mất áp lực cô lập và gây mỏi khớp vai khớp khuỷu.", severity: "high" }
    ]
  },
  {
    name: "Overhead Dumbbell Extension",
    slug: "overhead-dumbbell-extension",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
    description: "Cô lập đầu dài của cơ tay sau qua chuyển động qua đầu.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
    steps: [
      { stepOrder: 1, title: "Chuẩn bị", instruction: "Ngồi tựa lưng ghế hoặc đứng thẳng hai tay cầm một quả tạ đơn nhấc cao qua đầu." },
      { stepOrder: 2, title: "Hạ tạ sau đầu", instruction: "Hạ tạ đơn đi xuống phía sau đầu, cùi chỏ hướng lên trần nhà và ép sát đầu." },
      { stepOrder: 3, title: "Đẩy tạ lên", instruction: "Duỗi tay đẩy quả tạ thẳng lên trên đỉnh đầu bằng lực cơ tay sau." }
    ],
    commonMistakes: [
      { title: "Mở khuỷu tay quá rộng ra ngoài", description: "Làm dồn áp lực xấu lên khớp khuỷu tay và giảm hiệu quả cơ tay sau.", severity: "medium" }
    ]
  }
];

const programsConfig = [
  {
    title: "Giáo án Tăng Cân – Bulking 5x5",
    slug: "weight-gain-bulking-5x5",
    description: "Giáo án tập trung phát triển sức mạnh bộc phát và gia tăng trọng lượng cơ nạc tối đa bằng các bài compound hạng nặng.",
    goal: "weight_gain",
    difficulty: "intermediate",
    coverImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Sức mạnh Squat & Ngực",
        focusArea: "Đùi trước, Ngực, Vai, Tay sau",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "barbell-squat", order: 1, sets: 5, repsMin: 5, repsMax: 5, weight: 60, rest: 120, note: "Thực hiện gánh squat nặng an toàn chuẩn form." },
          { slug: "bench-press", order: 2, sets: 5, repsMin: 5, repsMax: 5, weight: 50, rest: 120, note: "Đẩy tạ đòn kiểm soát tốt bả vai cố định." },
          { slug: "arnold-press", order: 3, sets: 3, repsMin: 8, repsMax: 10, weight: 14, rest: 90, note: "Đẩy vai xoay cổ tay linh hoạt." },
          { slug: "skull-crushers", order: 4, sets: 3, repsMin: 10, repsMax: 12, weight: 15, rest: 75, note: "Khóa cùi chỏ duỗi tay sau siết cơ." }
        ]
      },
      { cycleDay: 2, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 3,
        title: "Sức mạnh Deadlift & Lưng xô",
        focusArea: "Đùi sau, Lưng, Tay trước",
        muscleMapUrl: muscleMapUrls.pull,
        exercises: [
          { slug: "deadlift", order: 1, sets: 5, repsMin: 5, repsMax: 5, weight: 80, rest: 150, note: "Siết chặt bụng khoá thẳng thắt lưng nâng tạ." },
          { slug: "barbell-bent-over-row", order: 2, sets: 4, repsMin: 6, repsMax: 8, weight: 45, rest: 90, note: "Kéo thanh đòn sát bụng ép cơ xô bả vai." },
          { slug: "pull-up", order: 3, sets: 4, repsMin: 6, repsMax: 10, weight: 0, rest: 90, note: "Kéo cằm qua xà giãn rộng xô lưng." },
          { slug: "barbell-bicep-curl", order: 4, sets: 3, repsMin: 8, repsMax: 12, weight: 15, rest: 75, note: "Cuốn tay trước tập trung cơ bắp tay." }
        ]
      },
      { cycleDay: 4, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 5,
        title: "Sức mạnh & Cơ bụng",
        focusArea: "Toàn thân, Cơ bụng",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "clean-and-press", order: 1, sets: 4, repsMin: 5, repsMax: 5, weight: 40, rest: 120, note: "Clean tạ lên vai đẩy mạnh qua đầu dứt khoát." },
          { slug: "farmers-walk", order: 2, sets: 3, repsMin: 30, repsMax: 30, weight: 24, rest: 90, note: "Xách tạ đi bộ bước nhỏ giữ vai cổ lưng thẳng." },
          { slug: "hanging-leg-raise", order: 3, sets: 3, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Đu xà nâng cao chân thẳng gồng bụng dưới." },
          { slug: "russian-twist", order: 4, sets: 3, repsMin: 20, repsMax: 20, weight: 0, rest: 45, note: "Xoay người hai bên thắt chặt cơ liên sườn bụng." }
        ]
      },
      { cycleDay: 6, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 7, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  },
  {
    title: "Giáo án Giảm Mỡ – HIIT & Strength",
    slug: "fat-loss-hiit-strength",
    description: "Đốt cháy calo dư thừa tối đa và duy trì khối lượng cơ nạc săn chắc nhờ sự kết hợp giữa nâng tạ kháng lực và chuỗi bài tập HIIT.",
    goal: "fat_loss",
    difficulty: "intermediate",
    coverImageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Cardio HIIT đốt mỡ",
        focusArea: "Toàn thân, Tim mạch",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "burpee", order: 1, sets: 4, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Thực hiện liên tục bùng nổ tim mạch." },
          { slug: "jump-squat", order: 2, sets: 4, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Bật nhảy tiếp đất chùng gối an toàn gối chân." },
          { slug: "mountain-climber", order: 3, sets: 4, repsMin: 30, repsMax: 30, weight: 0, rest: 45, note: "Chạy leo núi chống tay siết bụng thở đều." },
          { slug: "russian-twist", order: 4, sets: 3, repsMin: 20, repsMax: 25, weight: 0, rest: 45, note: "Xoay cơ liên sườn ép mỡ eo bụng." }
        ]
      },
      {
        cycleDay: 2,
        title: "Sức mạnh Thân trên",
        focusArea: "Ngực, Lưng, Vai",
        muscleMapUrl: muscleMapUrls.push,
        exercises: [
          { slug: "push-up", order: 1, sets: 4, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Chống đẩy thẳng lưng hông đùi siết bụng." },
          { slug: "pull-up", order: 2, sets: 4, repsMin: 8, repsMax: 10, weight: 0, rest: 90, note: "Hít xà co xô lưng kéo người qua cằm." },
          { slug: "arnold-press", order: 3, sets: 3, repsMin: 10, repsMax: 12, weight: 12, rest: 75, note: "Đẩy vai tạ đơn xoay vai xoay tay mượt." },
          { slug: "single-arm-dumbbell-row", order: 4, sets: 3, repsMin: 12, repsMax: 12, weight: 16, rest: 60, note: "Kéo tạ đơn sát sườn hông giữ lưng phẳng ghế." }
        ]
      },
      { cycleDay: 3, title: "Nghỉ ngơi phục hồi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 4,
        title: "Sức mạnh Thân dưới",
        focusArea: "Mông, Đùi",
        muscleMapUrl: muscleMapUrls.legs,
        exercises: [
          { slug: "goblet-squat", order: 1, sets: 4, repsMin: 12, repsMax: 15, weight: 16, rest: 75, note: "Ôm tạ squat mở gối thẳng lưng thắt lưng." },
          { slug: "bulgarian-split-squat", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 8, rest: 75, note: "Squat từng chân tựa ghế định hình vòng 3 săn chắc." },
          { slug: "glute-bridge", order: 3, sets: 3, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Nằm đẩy hông ép siết mông ở đỉnh nhịp cao." },
          { slug: "step-up", order: 4, sets: 3, repsMin: 12, repsMax: 15, weight: 6, rest: 60, note: "Bước chân lên bục giữ vai và hông cân đối." }
        ]
      },
      {
        cycleDay: 5,
        title: "Cơ bụng & Thể lực",
        focusArea: "Bụng bụng, Vai vai tay xô",
        muscleMapUrl: muscleMapUrls.core,
        exercises: [
          { slug: "battle-rope-slam", order: 1, sets: 4, repsMin: 30, repsMax: 30, weight: 0, rest: 60, note: "Quật dây thừng liên tục bùng nổ hết tốc lực." },
          { slug: "kettlebell-swing", order: 2, sets: 4, repsMin: 15, repsMax: 20, weight: 16, rest: 60, note: "Đẩy hông vung tạ ấm ngang tầm ngực siết cơ mông." },
          { slug: "ab-wheel-rollout", order: 3, sets: 3, repsMin: 10, repsMax: 12, weight: 0, rest: 60, note: "Lăn bánh xe tập bụng giữ thắt lưng thẳng cuộn core." },
          { slug: "hanging-leg-raise", order: 4, sets: 3, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Đu xà nâng chân thẳng gồng bụng siết chặt bụng." }
        ]
      },
      { cycleDay: 6, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 7, title: "Nghỉ ngơi hồi phục", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  },
  {
    title: "Giáo án Giữ Dáng – Maintenance Split",
    slug: "maintenance-split-program",
    description: "Chương trình nhẹ nhàng giúp duy trì chỉ số cơ thể cân đối bền bỉ khỏe khoắn lâu dài cho cả nam lẫn nữ.",
    goal: "maintenance",
    difficulty: "beginner",
    coverImageUrl: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Toàn thân A",
        focusArea: "Ngực, Lưng, Đùi trước, Core",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "push-up", order: 1, sets: 3, repsMin: 10, repsMax: 12, weight: 0, rest: 60, note: "Chống đẩy siết bụng nhẹ nhàng đúng tư thế." },
          { slug: "single-arm-dumbbell-row", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 14, rest: 60, note: "Kéo tạ đơn lưng xô chậm rãi cô lập." },
          { slug: "goblet-squat", order: 3, sets: 3, repsMin: 10, repsMax: 12, weight: 14, rest: 60, note: "Squat giữ lưng thẳng thắt bụng tự nhiên." },
          { slug: "russian-twist", order: 4, sets: 3, repsMin: 15, repsMax: 20, weight: 0, rest: 45, note: "Xoay người liên sườn săn chắc cơ bụng liên sườn." }
        ]
      },
      { cycleDay: 2, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 3,
        title: "Toàn thân B",
        focusArea: "Vai, Tay, Mông, Đùi sau",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "arnold-press", order: 1, sets: 3, repsMin: 10, repsMax: 12, weight: 10, rest: 75, note: "Xoay đẩy tạ tập cơ vai trước vai giữa." },
          { slug: "barbell-bicep-curl", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 12, rest: 60, note: "Cuốn tay trước tập trung bắp tay săn chắc." },
          { slug: "skull-crushers", order: 3, sets: 3, repsMin: 12, repsMax: 15, weight: 12, rest: 60, note: "Nằm đẩy tay sau từ từ duỗi cơ tay sau tốt." },
          { slug: "glute-bridge", order: 4, sets: 3, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Nằm nhấc hông mông săn chắc." }
        ]
      },
      { cycleDay: 4, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 5,
        title: "Cardio & Bụng chủ động",
        focusArea: "Tim mạch, Core",
        muscleMapUrl: muscleMapUrls.core,
        exercises: [
          { slug: "jump-squat", order: 1, sets: 3, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Nhảy lên tiếp đất nhẹ nhàng chùng gối." },
          { slug: "mountain-climber", order: 2, sets: 3, repsMin: 30, repsMax: 30, weight: 0, rest: 45, note: "Chạy leo núi siết cơ bụng core thở đều." },
          { slug: "hanging-leg-raise", order: 3, sets: 3, repsMin: 10, repsMax: 12, weight: 0, rest: 60, note: "Đu xà nâng chân siết cơ bụng dưới săn gọn." },
          { slug: "farmers-walk", order: 4, sets: 3, repsMin: 30, repsMax: 30, weight: 16, rest: 60, note: "Xách tạ đi bộ siết bụng nâng vai thẳng lưng." }
        ]
      },
      { cycleDay: 6, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 7, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  },
  {
    title: "Giáo án Nữ – Glute & Lower Body Focus",
    slug: "female-glute-focus-program",
    description: "Giáo án chuyên biệt thiết kế riêng cho phái đẹp tập trung cao độ vào phát triển nhóm cơ mông, đùi sau giúp tạo phom dáng vòng 3 hoàn hảo quyến rũ.",
    goal: "toning",
    difficulty: "beginner",
    coverImageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Phát triển Mông đùi A",
        focusArea: "Mông, Đùi sau",
        muscleMapUrl: muscleMapUrls.legs,
        exercises: [
          { slug: "barbell-hip-thrust", order: 1, sets: 4, repsMin: 10, repsMax: 12, weight: 30, rest: 90, note: "Tập trung đẩy hông siết mông thật sâu ở đỉnh." },
          { slug: "bulgarian-split-squat", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 6, rest: 75, note: "Squat từng chân tập cơ mông đùi trước mông săn tròn." },
          { slug: "cable-glute-kickback", order: 3, sets: 3, repsMin: 12, repsMax: 15, weight: 10, rest: 60, note: "Đá cáp cơ mông xô ngang vai chân sau thẳng." },
          { slug: "glute-bridge", order: 4, sets: 3, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Nhấn gót đẩy hông siết mông đỉnh nhịp cao." }
        ]
      },
      {
        cycleDay: 2,
        title: "Thân trên thon gọn",
        focusArea: "Lưng xô, Vai liên sườn, Bụng core",
        muscleMapUrl: muscleMapUrls.push,
        exercises: [
          { slug: "pull-up", order: 1, sets: 3, repsMin: 5, repsMax: 8, weight: 0, rest: 90, note: "Nếu chưa hít xà đơn tự do được, hãy dùng chun trợ lực." },
          { slug: "face-pull", order: 2, sets: 3, repsMin: 12, repsMax: 15, weight: 10, rest: 60, note: "Kéo cáp ngang trán mở vai bả vai ra sau giữ bả vai." },
          { slug: "russian-twist", order: 3, sets: 3, repsMin: 20, repsMax: 20, weight: 0, rest: 45, note: "Xoay người thon gọn eo liên sườn bụng." },
          { slug: "hanging-leg-raise", order: 4, sets: 3, repsMin: 10, repsMax: 12, weight: 0, rest: 60, note: "Đu xà nâng chân co gối nhẹ nâng cao bụng dưới." }
        ]
      },
      { cycleDay: 3, title: "Nghỉ ngơi phục hồi cơ mông", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 4,
        title: "Phát triển Mông đùi B",
        focusArea: "Mông mông, Đùi đùi chân",
        muscleMapUrl: muscleMapUrls.legs,
        exercises: [
          { slug: "sumo-deadlift", order: 1, sets: 4, repsMin: 8, repsMax: 10, weight: 40, rest: 90, note: "Deadlift chân rất rộng mũi chân 45 độ tập trung cơ mông hông." },
          { slug: "goblet-squat", order: 2, sets: 3, repsMin: 12, repsMax: 12, weight: 12, rest: 75, note: "Squat giữ ngực cao giữ tạ trước ngực chắc chắn." },
          { slug: "step-up", order: 3, sets: 3, repsMin: 12, repsMax: 12, weight: 6, rest: 60, note: "Bước chân lên bục siết chặt mông đẩy thẳng đùi gối." },
          { slug: "lying-leg-curl", order: 4, sets: 3, repsMin: 12, repsMax: 15, weight: 15, rest: 60, note: "Nằm cuốn đùi sau máy giúp săn chắc đùi sau." }
        ]
      },
      { cycleDay: 5, title: "Nghỉ ngơi hoàn toàn", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 6, title: "Nghỉ ngơi hoàn toàn", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  },
  {
    title: "Giáo án Nữ – Full Body Slim",
    slug: "female-fullbody-slim-program",
    description: "Chương trình giảm mỡ toàn thân tạo khối cơ thon gọn nhẹ nhàng nữ tính bằng các tổ hợp HIIT cùng bài tập kháng lực toàn diện.",
    goal: "fat_loss",
    difficulty: "beginner",
    coverImageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Đốt mỡ toàn thân A",
        focusArea: "Toàn thân, Đốt mỡ thừa",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "burpee", order: 1, sets: 3, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Burpee nhảy cao dứt khoát đốt mỡ tim mạch." },
          { slug: "jump-squat", order: 2, sets: 3, repsMin: 15, repsMax: 15, weight: 0, rest: 60, note: "Squat nhảy êm chân tiếp đất nhẹ mũi chân." },
          { slug: "mountain-climber", order: 3, sets: 3, repsMin: 30, repsMax: 30, weight: 0, rest: 45, note: "Chạy bụng plank siết bụng đùi." },
          { slug: "russian-twist", order: 4, sets: 3, repsMin: 20, repsMax: 20, weight: 0, rest: 45, note: "Xoay eo thon cơ liên sườn." }
        ]
      },
      { cycleDay: 2, title: "Nghỉ ngơi chủ động", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 3,
        title: "Thân trên & Cơ bụng săn chắc",
        focusArea: "Ngực, Lưng, Vai, Core",
        muscleMapUrl: muscleMapUrls.push,
        exercises: [
          { slug: "push-up", order: 1, sets: 3, repsMin: 10, repsMax: 12, weight: 0, rest: 60, note: "Chống đẩy nhẹ nhàng đúng form vai thẳng." },
          { slug: "single-arm-dumbbell-row", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 10, rest: 60, note: "Kéo tạ đơn xô chậm giãn lưng." },
          { slug: "front-dumbbell-raise", order: 3, sets: 3, repsMin: 12, repsMax: 12, weight: 4, rest: 60, note: "Nâng vai trước thon gọn vai cánh tay." },
          { slug: "ab-wheel-rollout", order: 4, sets: 3, repsMin: 8, repsMax: 10, weight: 0, rest: 60, note: "Lăn bánh xe bụng giữ thắt lưng chắc gồng bụng." }
        ]
      },
      { cycleDay: 4, title: "Nghỉ ngơi chủ động", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 5,
        title: "Săn chắc Mông & Đùi",
        focusArea: "Mông, Đùi, Chân",
        muscleMapUrl: muscleMapUrls.legs,
        exercises: [
          { slug: "glute-bridge", order: 1, sets: 3, repsMin: 15, repsMax: 20, weight: 0, rest: 60, note: "Đẩy hông siết mông căng ở đỉnh 2 giây." },
          { slug: "bulgarian-split-squat", order: 2, sets: 3, repsMin: 10, repsMax: 10, weight: 4, rest: 75, note: "Squat một chân săn chắc cơ mông đùi sau." },
          { slug: "step-up", order: 3, sets: 3, repsMin: 12, repsMax: 12, weight: 4, rest: 60, note: "Bước bục săn chân thon thả dáng đi." },
          { slug: "kettlebell-swing", order: 4, sets: 3, repsMin: 15, repsMax: 15, weight: 12, rest: 60, note: "Vung tạ ấm đẩy mông đùi sau bùng nổ." }
        ]
      },
      { cycleDay: 6, title: "Nghỉ ngơi hoàn toàn", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 7, title: "Nghỉ ngơi hoàn toàn", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  },
  {
    title: "Giáo án Tăng Cơ Nâng Cao – Intensity Split",
    slug: "advanced-intensity-muscle-gain",
    description: "Giáo án phân tách cường độ cực cao dành cho gymer lâu năm muốn bứt phá giới hạn phát triển kích thước các sợi cơ tối đa.",
    goal: "muscle_gain",
    difficulty: "advanced",
    coverImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800",
    days: [
      {
        cycleDay: 1,
        title: "Ngực & Lưng nặng",
        focusArea: "Ngực, Lưng xô",
        muscleMapUrl: muscleMapUrls.push,
        exercises: [
          { slug: "decline-bench-press", order: 1, sets: 4, repsMin: 6, repsMax: 8, weight: 60, rest: 120, note: "Đẩy ngực dưới đòn nặng chuẩn form khóa bả vai." },
          { slug: "barbell-bent-over-row", order: 2, sets: 4, repsMin: 6, repsMax: 8, weight: 50, rest: 90, note: "Kéo tạ đòn gập người nặng giữ thẳng thắt lưng." },
          { slug: "cable-crossover", order: 3, sets: 3, repsMin: 10, repsMax: 12, weight: 20, rest: 75, note: "Ép cáp siết rãnh ngực căng giãn tối đa cơ ngực." },
          { slug: "t-bar-row", order: 4, sets: 3, repsMin: 8, repsMax: 10, weight: 35, rest: 90, note: "Kéo tạ chữ T dày lưng bả vai ép mạnh sau lưng." }
        ]
      },
      {
        cycleDay: 2,
        title: "Chân & Cơ bụng nặng",
        focusArea: "Đùi trước đùi sau, Mông, Cơ bụng",
        muscleMapUrl: muscleMapUrls.legs,
        exercises: [
          { slug: "sumo-deadlift", order: 1, sets: 4, repsMin: 5, repsMax: 6, weight: 100, rest: 150, note: "Sumo Deadlift nặng nhấn mạnh gót chân siết mông thẳng cột sống." },
          { slug: "goblet-squat", order: 2, sets: 4, repsMin: 8, repsMax: 10, weight: 24, rest: 90, note: "Squat tạ ấm tạ đơn nặng giữ thẳng ngực bả vai." },
          { slug: "bulgarian-split-squat", order: 3, sets: 3, repsMin: 8, repsMax: 10, weight: 16, rest: 90, note: "BSS gập gối chân sau ghế tập siết đùi gối." },
          { slug: "hanging-leg-raise", order: 4, sets: 3, repsMin: 12, repsMax: 15, weight: 0, rest: 60, note: "Đu xà nâng chân thẳng siết cơ bụng múi." }
        ]
      },
      { cycleDay: 3, title: "Nghỉ ngơi tái tạo cơ bắp", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      {
        cycleDay: 4,
        title: "Vai & Tay nặng",
        focusArea: "Vai, Tay trước, Tay sau",
        muscleMapUrl: muscleMapUrls.shoulders,
        exercises: [
          { slug: "arnold-press", order: 1, sets: 4, repsMin: 6, repsMax: 8, weight: 16, rest: 90, note: "Đẩy vai Arnold xoay vai bùng nổ cơ vai vai tròn." },
          { slug: "face-pull", order: 2, sets: 3, repsMin: 10, repsMax: 12, weight: 15, rest: 60, note: "Kéo cáp ngang trán cơ vai sau lưng trên." },
          { slug: "barbell-bicep-curl", order: 3, sets: 3, repsMin: 8, repsMax: 10, weight: 20, rest: 75, note: "Cuốn tạ đòn tay trước giữ vững cùi chỏ." },
          { slug: "skull-crushers", order: 4, sets: 3, repsMin: 8, repsMax: 10, weight: 20, rest: 75, note: "Skullcrushers tay sau khóa gối duỗi tay siết lực." }
        ]
      },
      {
        cycleDay: 5,
        title: "Sức mạnh & Thể lực",
        focusArea: "Toàn thân, Thể lực tim mạch",
        muscleMapUrl: muscleMapUrls.fullbody,
        exercises: [
          { slug: "clean-and-press", order: 1, sets: 4, repsMin: 5, repsMax: 5, weight: 45, rest: 120, note: "Đẩy tạ đòn bùng nổ sức mạnh Clean press." },
          { slug: "farmers-walk", order: 2, sets: 3, repsMin: 40, repsMax: 40, weight: 28, rest: 90, note: "Farmer walk xách tạ nặng đi thẳng tiến." },
          { slug: "burpee", order: 3, sets: 3, repsMin: 15, repsMax: 15, weight: 0, rest: 60, note: "Burpee nhảy cao dứt khoát tăng nhịp tim đốt calo." },
          { slug: "ab-wheel-rollout", order: 4, sets: 3, repsMin: 10, repsMax: 10, weight: 0, rest: 60, note: "Lăn bụng bánh xe giữ thắt lưng chắc cuộn core." }
        ]
      },
      { cycleDay: 6, title: "Nghỉ ngơi hoàn phục cơ bắp", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null },
      { cycleDay: 7, title: "Nghỉ ngơi phục hồi", focusArea: "Toàn thân", isRest: true, muscleMapUrl: null }
    ]
  }
];

const getExerciseBySlug = async (slug) => {
  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) {
    console.warn(`Bỏ qua bài tập chưa có trong DB: ${slug}`);
  }
  return exercise;
};

const seedProgramDay = async (programId, day) => {
  const programDay = await prisma.workoutProgramDay.create({
    data: {
      programId,
      cycleDay: day.cycleDay,
      title: day.title,
      focusArea: day.focusArea,
      muscleMapUrl: day.muscleMapUrl || null,
      description: day.isRest
        ? "Ngày nghỉ để phục hồi cơ bắp và hệ thần kinh."
        : `Buổi tập tập trung vào các nhóm cơ: ${day.focusArea}.`,
    },
  });

  if (day.isRest) return;

  const template = await prisma.workoutTemplate.create({
    data: {
      programDayId: programDay.id,
      title: day.title,
      description: `Mục tiêu phát triển nhóm cơ: ${day.focusArea}.`,
      estimatedDurationMinutes: 60,
    },
  });

  for (const item of day.exercises) {
    const exercise = await getExerciseBySlug(item.slug);
    if (!exercise) continue;

    await prisma.workoutTemplateExercise.create({
      data: {
        workoutTemplateId: template.id,
        exerciseId: exercise.id,
        exerciseOrder: item.order,
        sets: item.sets,
        repsMin: item.repsMin,
        repsMax: item.repsMax,
        weightKg: item.weight > 0 ? item.weight : null,
        restSeconds: item.rest || 60,
        tempo: "2-0-1-0",
        note: item.note || "",
      },
    });
  }
};

const main = async () => {
  console.log("Bắt đầu seed dữ liệu bài tập và giáo án luyện tập nâng cao...");

  // 1. Seed exercises
  let index = 0;
  for (const item of exercisesConfig) {
    const equipment = await prisma.equipment.findUnique({ where: { slug: item.equipmentSlug } });
    const thumbnailUrl = await uploadExerciseImage(item, index);
    index++;

    // Upsert Exercise
    const exercise = await prisma.exercise.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        difficulty: item.difficulty,
        exerciseType: item.exerciseType,
        primaryEquipmentId: equipment?.id || null,
        thumbnailUrl,
        videoUrl: item.videoUrl,
        isPublished: true,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        difficulty: item.difficulty,
        exerciseType: item.exerciseType,
        primaryEquipmentId: equipment?.id || null,
        thumbnailUrl,
        videoUrl: item.videoUrl,
        isPublished: true,
      },
    });

    // Seed steps
    await prisma.exerciseStep.deleteMany({ where: { exerciseId: exercise.id } });
    if (item.steps) {
      await prisma.exerciseStep.createMany({
        data: item.steps.map(step => ({
          exerciseId: exercise.id,
          stepOrder: step.stepOrder,
          title: step.title,
          instruction: step.instruction
        }))
      });
    }

    // Seed common mistakes
    await prisma.exerciseCommonMistake.deleteMany({ where: { exerciseId: exercise.id } });
    if (item.commonMistakes) {
      await prisma.exerciseCommonMistake.createMany({
        data: item.commonMistakes.map(mistake => ({
          exerciseId: exercise.id,
          title: mistake.title,
          description: mistake.description,
          severity: mistake.severity || "medium"
        }))
      });
    }

    // Seed muscles
    await prisma.exerciseMuscle.deleteMany({ where: { exerciseId: exercise.id } });
    for (const muscle of item.muscles) {
      const muscleGroup = await prisma.muscleGroup.findUnique({ where: { slug: muscle.slug } });
      if (!muscleGroup) continue;

      await prisma.exerciseMuscle.create({
        data: {
          exerciseId: exercise.id,
          muscleGroupId: muscleGroup.id,
          role: muscle.role,
        },
      });
    }

    // Seed tags
    await prisma.exerciseTag.deleteMany({ where: { exerciseId: exercise.id } });
    await prisma.exerciseTag.createMany({
      data: item.tags.map((tag) => ({
        exerciseId: exercise.id,
        tag,
      })),
      skipDuplicates: true,
    });

    console.log(`Đã seed bài tập: ${item.name}`);
  }

  // 2. Seed programs
  let pIndex = 0;
  for (const item of programsConfig) {
    const coverImageUrl = await uploadProgramCoverImage(item, pIndex);
    pIndex++;

    const program = await prisma.workoutProgram.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        goal: item.goal,
        difficulty: item.difficulty,
        coverImageUrl,
        isPublished: true,
        price: 0,
        metadata: {
          cycleLength: item.days.length,
          scheduleType: "recurring",
        },
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        goal: item.goal,
        difficulty: item.difficulty,
        coverImageUrl,
        isPublished: true,
        price: 0,
        metadata: {
          cycleLength: item.days.length,
          scheduleType: "recurring",
        },
      },
    });

    await prisma.workoutProgramDay.deleteMany({ where: { programId: program.id } });

    for (const day of item.days) {
      await seedProgramDay(program.id, day);
    }

    console.log(`Đã seed giáo án: ${item.title}`);
  }

  // 3. Clean up image directory
  try {
    await fs.rm(IMAGE_DIR, { recursive: true, force: true });
    console.log("Đã dọn dẹp thư mục tải ảnh tạm thời.");
  } catch (err) {
    console.warn("Lỗi khi dọn dẹp thư mục ảnh tạm thời:", err.message);
  }

  console.log("Seed hoàn tất thành công!");
};

main()
  .catch((error) => {
    console.error("Lỗi seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
