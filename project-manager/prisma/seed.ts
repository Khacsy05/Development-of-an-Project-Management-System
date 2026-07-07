import { PrismaClient, UserRole } from '../src/generated/prisma'; // Sửa lại đường dẫn import cho đúng với output client của bạn

const prisma = new PrismaClient();

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

  // 2. Tạo tài khoản Giảng viên (User)
  const lecturerUser = await prisma.user.upsert({
    where: { username: 'gv_nguyenvana' },
    update: {},
    create: {
      user_id: 1001n,
      usercode: 'GV001',
      username: 'gv_nguyenvana',
      password: 'password_da_ma_hoa_cho_nay', // Nhớ mã hóa thực tế bằng bcrypt sau này
      email: 'anv@tlu.edu.vn',
      fullname: 'Nguyễn Văn A',
      role_id: lecturerRole.role_id,
    },
  });

  // 3. Tạo tài khoản Sinh viên (User)
  const studentUser = await prisma.user.upsert({
    where: { username: 'sv_2351170612' },
    update: {},
    create: {
      user_id: 2351170612n, // Đúng số ID lớn bạn muốn
      usercode: '2351170612',
      username: 'sv_2351170612',
      password: 'password_da_ma_hoa_cho_nay',
      email: 'student1@e.tlu.edu.vn',
      fullname: 'Trần Thị B',
      role_id: studentRole.role_id,
    },
  });

  // 4. Tạo Chuyên ngành và Lớp học
  const major = await prisma.major.create({
    data: {
      major_id: 1n,
      major_name: 'Hệ thống thông tin',
    },
  });

  const classData = await prisma.class.create({
    data: {
      class_id: 1n,
      class_name: '65HTTT',
      major_id: major.major_id,
      lecturer_id: lecturerUser.user_id, // Gán giảng viên quản lý lớp
    },
  });

  // 5. Tạo thông tin bổ sung cho Sinh viên (StudentProfile)
  await prisma.studentProfile.upsert({
    where: { user_id: studentUser.user_id },
    update: {},
    create: {
      user_id: studentUser.user_id,
      class_id: classData.class_id,
      gpa: 3.55,
    },
  });

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