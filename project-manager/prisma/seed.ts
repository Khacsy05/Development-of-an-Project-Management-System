import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, UserRole } from '../src/generated/prisma'; // Sửa lại đường dẫn import cho đúng với output client của bạn

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname || 'localhost',
  port: url.port ? parseInt(url.port) : 3306,
  user: decodeURIComponent(url.username) || 'root',
  password: decodeURIComponent(url.password) || undefined,
  database: decodeURIComponent(url.pathname.substring(1)),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // 1. Tạo các Vai trò (Role)
  // Sử dụng upsert để nếu chạy lại lệnh seed không bị trùng lặp dữ liệu
  const adminRole = await prisma.role.upsert({
    where: { role_name: UserRole.Admin },
    update: {},
    create: { role_id: 1n, role_name: UserRole.Admin },
  });

  const lecturerRole = await prisma.role.upsert({
    where: { role_name: UserRole.Lecturer },
    update: {},
    create: { role_id: 2n, role_name: UserRole.Lecturer },
  });


  const studentRole = await prisma.role.upsert({
    where: { role_name: UserRole.Student },
    update: {},
    create: { role_id: 3n, role_name: UserRole.Student },
  });

  const facultyRole = await prisma.role.upsert({
    where: { role_name: UserRole.Faculty },
    update: {},
    create: { role_id: 4n, role_name: UserRole.Faculty },
  });


  // 2. Tạo tài khoản Giảng viên (User)
  // Cho vòng lặp chạy từ 1 đến 6 để tạo tự động 6 giảng viên
  for (let i = 1; i <= 6; i++) {
    // Tự động tính toán giá trị dựa theo biến chạy i
    const userId = 1000n + BigInt(i);              // Sẽ sinh ra: 1001n, 1002n, 1003n...
    const usercode = `GV${String(i).padStart(3, '0')}`; // Sẽ sinh ra: GV001, GV002, GV003...
    const username = `gv_giangvien${i}`;           // Sẽ sinh ra: gv_giangvien1, gv_giangvien2...

    await prisma.user.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: 'password_da_ma_hoa_cho_nay',
        email: `giangvien${i}@tlu.edu.vn`,
        fullname: `Giảng Viên Thử Nghiệm ${i}`,
        role_id: lecturerRole.role_id, // Gán quyền Giảng viên đã tạo ở bước trước
      },
    });
  }


  // 4. Tạo Chuyên ngành và Lớp học
  const major = await prisma.major.upsert({
    where: { major_id: 1n },
    update: {},
    create: {
      major_id: 1n,
      major_name: 'Hệ thống thông tin',
    },
  });

  const cacNganhKhac = [
    'Công nghệ thông tin',
    'Kỹ thuật phần mềm',
    'Khoa học máy tính',
    'An toàn thông tin',
    'Quản trị kinh doanh',
  ];

  // Duyệt mảng để tự động tăng major_id từ số 2n trở đi
  for (let index = 0; index < cacNganhKhac.length; index++) {
    const nextMajorId = 2n + BigInt(index); // Sẽ sinh ra: 2n, 3n, 4n, 5n...

    await prisma.major.upsert({
      where: { major_id: nextMajorId },
      update: {},
      create: {
        major_id: nextMajorId,
        major_name: cacNganhKhac[index],
      },
    });
  }

  const classData = await prisma.class.upsert({
    where: { class_id: 1n },
    update: {},
    create: {
      class_id: 1n,
      class_name: '65HTTT',
      major_id: major.major_id,
      lecturer_id: 1001n, // Gán giảng viên quản lý lớp
    },
  });

  const danhSachLopKhac = [
    { name: '63CNTT4', majorId: 2n, lecturerId: 1002n }, // Lớp ngành CNTT (2n), giảng viên GV002 quản lý
    { name: '64KTPM1', majorId: 3n, lecturerId: 1003n }, // Lớp ngành KTPM (3n), giảng viên GV003 quản lý
    { name: '65CNTT1', majorId: 2n, lecturerId: 1004n },
    { name: '65HTTT2', majorId: 1n, lecturerId: 1005n },
    { name: '64KHMT1', majorId: 4n, lecturerId: 1006n },
  ];

  // Duyệt mảng để tự động tăng class_id từ số 2n trở đi
  for (let index = 0; index < danhSachLopKhac.length; index++) {
    const nextClassId = 2n + BigInt(index); // Sẽ sinh ra: 2n, 3n, 4n, 5n...
    const lop = danhSachLopKhac[index];

    await prisma.class.upsert({
      where: { class_id: nextClassId },
      update: {},
      create: {
        class_id: nextClassId,
        class_name: lop.name,
        major_id: lop.majorId,
        lecturer_id: lop.lecturerId,
      },
    });
  }

  // 5. Tạo tài khoản Sinh viên và thông tin bổ sung cho Sinh viên (StudentProfile)
  for (let i = 1; i <= 5; i++) {
    const userId = 2351170610n + BigInt(i); // Sẽ sinh ra: 2351170611n, 2351170612n, 2351170613n...
    const usercode = `SV${String(i).padStart(3, '0')}`;
    const username = `sv_sinhhvien${i}`;
    await prisma.user.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: 'password_da_ma_hoa_cho_nay',
        email: `student${i}@e.tlu.edu.vn`,
        fullname: `Sinh Viên Thử Nghiệm ${i}`,
        role_id: studentRole.role_id,
      },
    });
    const randomClassId = BigInt((i % 6) + 1);
    const randomGPA = parseFloat((2.0 + Math.random() * 2.0).toFixed(2));
    await prisma.studentProfile.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        class_id: randomClassId,
        gpa: randomGPA,
      },
    });
  }

  console.log('✅ Seed dữ liệu thành công!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    await prisma.$disconnect();
    process.exit(1);
  });