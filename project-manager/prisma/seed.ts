import bcrypt from 'bcryptjs';
import { UserRole, CapstoneStatus } from '../src/generated/prisma'; // Sửa lại đường dẫn import cho đúng với output client của bạn
import { prisma } from '@/lib/prisma';




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

  const hashedPassword = await bcrypt.hash('password_da_ma_hoa_cho_nay', 10);

  const danhSachFaculty = [
    { faculty_code: 'CNTT', name: 'Khoa Công nghệ thông tin' },
    { faculty_code: 'CT', name: 'Khoa Công trình' },
    { faculty_code: 'KT', name: 'Khoa Kinh tế' },
    { faculty_code: 'CK', name: 'Khoa Cơ Khí' },
    { faculty_code: 'KTN', name: 'Khoa Khoa học tự nhiên' },
    { faculty_code: 'KHXH', name: 'Khoa Khoa học xã hội' },
    { faculty_code: 'QTKD', name: 'Khoa Quản trị kinh doanh' },
  ];

  for (let index = 0; index < danhSachFaculty.length; index++) {
    const faculty = danhSachFaculty[index];
    const falcultyId = 1000n + BigInt(index); 
    await prisma.faculty.upsert({
      where: { faculty_code: faculty.faculty_code },
      update: {},
      create: {
        faculty_id: falcultyId,
        faculty_code: faculty.faculty_code,
        name: faculty.name,
      },
    });
  }

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
        password: hashedPassword,
        email: `giangvien${i}@tlu.edu.vn`,
        fullname: `Giảng Viên Thử Nghiệm ${i}`,
        role_id: lecturerRole.role_id, // Gán quyền Giảng viên đã tạo ở bước trước
      },
    });
  }

  for (let i = 1; i <= 7; i++) {
    // Tự động tính toán giá trị dựa theo biến chạy i
    const userId = 10n + BigInt(i);  
    const facultyId = 1000n + BigInt(i);              
    const usercode = `HDK${String(i).padStart(3, '0')}`; // Sẽ sinh ra: GV001, GV002, GV003...
    const username = `hdk_hoidongkhoa${i}`;           // Sẽ sinh ra: gv_hoidongkhoa1, gv_hoidongkhoa2...

    await prisma.user.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: hashedPassword,
        faculty_id: facultyId,
        email: `hoidongkhoa${i}@tlu.edu.vn`,
        fullname: `Hội đồng khoa ${i}`,
        role_id: facultyRole.role_id, // Gán quyền Giảng viên đã tạo ở bước trước
      },
    });
  }

  const admin = await prisma.user.upsert({
    where: { user_id: 1n },
      update: {},
      create: {
        user_id: 1n,
        usercode: "ADMIN001",
        username: "admin",
        password: hashedPassword,
        email: "admin@tlu.edu.vn",
        fullname: "Quản trị viên",
        role_id: adminRole.role_id, // Gán quyền Quản trị viên đã tạo ở bước trước
      },
  })

  // 4. Tạo Chuyên ngành và Lớp học
  const major = await prisma.major.upsert({
    where: { major_id: 1n },
    update: {},
    create: {
      major_id: 1n,
      major_name: 'Hệ thống thông tin',
      faculty_id: 1000n, // Gán cho Khoa CNTT (faculty_id: 1001n)
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
        faculty_id: 1000n, // Gán cho Khoa CNTT (faculty_id: 1001n)
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
    const username = `sv_sinhvien${i}`;
    await prisma.user.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: hashedPassword,
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

  const danhSachNamHoc = [
    { year_name: '2022-2023', star_year: 2022, end_year: 2023 },
    { year_name: '2023-2024', star_year: 2023, end_year: 2024 },
    { year_name: '2024-2025', star_year: 2024, end_year: 2025 },
    { year_name: '2025-2026', star_year: 2025, end_year: 2026 },
  ];
  for (let index = 0; index < danhSachNamHoc.length; index++) {
    const nextAcademicYearId = 1n + BigInt(index); // Sẽ sinh ra: 1n, 2n, 3n, 4n...
    const namHoc = danhSachNamHoc[index];
    await prisma.academicYear.upsert({
      where: { year_id: nextAcademicYearId },
      update: {
        year_id: nextAcademicYearId,
        year_name: namHoc.year_name,
        start_year: namHoc.star_year,
        end_year: namHoc.end_year,
      },
      create: {
        year_id: nextAcademicYearId,
        year_name: namHoc.year_name,
        start_year: namHoc.star_year,
        end_year: namHoc.end_year,
      },
    });
  }

  const danhSachHocKy = [
    { targetYearName: '2022-2023', semester_name: 'Học kỳ 1', startMonthDay: '09-01', endMonthDay: '01-15' },
    { targetYearName: '2022-2023', semester_name: 'Học kỳ 2', startMonthDay: '02-01', endMonthDay: '06-30' },
    { targetYearName: '2023-2024', semester_name: 'Học kỳ 3', startMonthDay: '09-01', endMonthDay: '01-15' },
    { targetYearName: '2023-2024', semester_name: 'Học kỳ 4', startMonthDay: '02-01', endMonthDay: '06-30' },
    { targetYearName: '2024-2025', semester_name: 'Học kỳ 5', startMonthDay: '09-01', endMonthDay: '01-15' },
    { targetYearName: '2024-2025', semester_name: 'Học kỳ 6', startMonthDay: '02-01', endMonthDay: '06-30' },
    { targetYearName: '2025-2026', semester_name: 'Học kỳ 7', startMonthDay: '09-01', endMonthDay: '1-15' },
    { targetYearName: '2025-2026', semester_name: 'Học kỳ 8', startMonthDay: '02-01', endMonthDay: '06-30' },
  ];

  for (let index = 0; index < danhSachHocKy.length; index++) {
    const nextSemesterId = 1n + BigInt(index); // Sẽ sinh ra: 1n, 2n, 3n...
    const hocKy = danhSachHocKy[index];
    const academicYearData = await prisma.academicYear.findFirst({
      where: { year_name: hocKy.targetYearName }
    });
    if (!academicYearData) {
      throw new Error(`Không tìm thấy năm học có tên là ${hocKy.targetYearName} trong DB!`);
    }
    const fullStartDate = new Date(`${academicYearData.start_year}-${hocKy.startMonthDay}`);

    // Học kỳ 1 thường kết thúc vào đầu năm sau (ví dụ tháng 1 năm 2024), nên ta dùng end_year của năm học
    const fullEndDate = new Date(`${academicYearData.end_year}-${hocKy.endMonthDay}`);
    await prisma.semester.upsert({
      where: { semester_id: nextSemesterId },
      update: {
        semester_id: nextSemesterId,
        year_id: academicYearData.year_id,
        semester_name: hocKy.semester_name,
        start_date: fullStartDate,
        end_date: fullEndDate,
      },
      create: {
        semester_id: nextSemesterId,
        year_id: academicYearData.year_id,
        semester_name: hocKy.semester_name,
        start_date: fullStartDate,
        end_date: fullEndDate,
      },
    });
  }

  // ==========================================
  // 6. Tạo Mốc thời gian nộp bài (Milestones)
  // ==========================================
  // Ta sẽ tạo mốc thời gian mẫu cho Học kỳ 8 (semester_id: 8n - Kỳ đang làm đồ án)
  const danhSachMilestones = [
    { phase_name: 'Nộp đề cương sơ bộ', daysFromStart: 15, description: 'Sinh viên nộp file PDF đề cương đồ án có chữ ký GVHD.' },
    { phase_name: 'Báo cáo tiến độ lần 1', daysFromStart: 45, description: 'Báo cáo tiến độ hoàn thành 30% khối lượng công việc.' },
    { phase_name: 'Báo cáo tiến độ lần 2', daysFromStart: 75, description: 'Báo cáo tiến độ hoàn thành 70% khối lượng công việc.' },
    { phase_name: 'Nộp báo cáo cuối cùng', daysFromStart: 105, description: 'Nộp toàn bộ source code lên GitHub và file báo cáo bản cứng.' },
  ];

  // Lấy ngày bắt đầu của học kỳ 8 để làm mốc tính deadline tự động
  const targetSemester = await prisma.semester.findUnique({ where: { semester_id: 8n } });
  const baseDate = targetSemester ? new Date(targetSemester.start_date) : new Date();

  for (let index = 0; index < danhSachMilestones.length; index++) {
    const nextMilestoneId = 1n + BigInt(index);
    const ms = danhSachMilestones[index];

    // Tự động cộng thêm ngày để ra deadline thực tế sinh động
    const deadlineDate = new Date(baseDate);
    deadlineDate.setDate(deadlineDate.getDate() + ms.daysFromStart);

    await prisma.milestone.upsert({
      where: { milestone_id: nextMilestoneId },
      update: {},
      create: {
        milestone_id: nextMilestoneId,
        semester_id: 8n, // Gán cho học kỳ 8 mẫu
        phase_name: ms.phase_name,
        description: ms.description,
        deadline: deadlineDate,
      },
    });
  }

  // ==========================================
  // 7. Tạo Lĩnh vực chuyên môn (Expertises)
  // ==========================================
  const danhSachChuyenMon = [
    { name: 'Web Development', description: 'Phát triển ứng dụng Web hệ sinh thái PHP/NodeJS/Python...' },
    { name: 'AI & Machine Learning', description: 'Trí tuệ nhân tạo, xử lý ngôn ngữ tự nhiên, học máy...' },
    { name: 'Mobile App Development', description: 'Phát triển ứng dụng di động Flutter, React Native, Native...' },
    { name: 'Cloud Computing & DevOps', description: 'Hệ thống đám mây AWS, Docker, Kubernetes, CI/CD...' },
  ];

  for (let index = 0; index < danhSachChuyenMon.length; index++) {
    const nextExpertiseId = 1n + BigInt(index);
    const exp = danhSachChuyenMon[index];
    await prisma.expertise.upsert({
      where: { expertise_id: nextExpertiseId },
      update: {},
      create: {
        expertise_id: nextExpertiseId,
        name: exp.name,
        description: exp.description,
      },
    });
  }

  // ==========================================
  // 8. Gán chuyên môn cho Giảng viên (LecturerExpertises)
  // ==========================================
  // Gán ngẫu nhiên cho 6 giảng viên (ID từ 1001n -> 1006n) mỗi người 1-2 chuyên môn mẫu
  for (let i = 1; i <= 6; i++) {
    const currentLecturerId = 1000n + BigInt(i);
    // Giảng viên lẻ gán chuyên môn 1 & 2, giảng viên chẵn gán chuyên môn 3 & 4
    const primaryExpId = i % 2 === 1 ? 1n : 3n;
    const secondaryExpId = i % 2 === 1 ? 2n : 4n;

    // Do bảng này là quan hệ M:N dùng Composite Key (lecturer_id_expertise_id), 
    // cú pháp where của upsert trong Prisma sẽ gộp chung 2 khóa:
    await prisma.lecturerExpertise.upsert({
      where: {
        lecturer_id_expertise_id: {
          lecturer_id: currentLecturerId,
          expertise_id: primaryExpId
        }
      },
      update: {},
      create: {
        lecturer_id: currentLecturerId,
        expertise_id: primaryExpId
      }
    });

    await prisma.lecturerExpertise.upsert({
      where: {
        lecturer_id_expertise_id: {
          lecturer_id: currentLecturerId,
          expertise_id: secondaryExpId
        }
      },
      update: {},
      create: {
        lecturer_id: currentLecturerId,
        expertise_id: secondaryExpId
      }
    });
  }

  // ==========================================
  // 9. Tạo Ngân hàng Đề tài (Topics)
  // ==========================================
  const danhSachDeTai = [
    { title: 'Xây dựng hệ thống quản lý thực tập sinh IPMS', expId: 1n, tech: 'Laravel, React, Tailwind CSS, Docker', isBank: 1, createdBy: 1001n },
    { title: 'Ứng dụng Học sâu nhận diện khuôn mặt điểm danh sinh viên', expId: 2n, tech: 'Python, Fast API, PyTorch, MySQL', isBank: 1, createdBy: 1002n },
    { title: 'Xây dựng App quản lý chi tiêu cá nhân thông minh', expId: 3n, tech: 'Flutter, NodeJS, MongoDB', isBank: 1, createdBy: 1003n },
    { title: 'Triển khai hạ tầng Microservices phục vụ E-commerce', expId: 4n, tech: 'AWS, Kubernetes, Docker, Go', isBank: 1, createdBy: 1004n },
    { title: 'Nghiên cứu đề xuất Hệ thống Đặt phòng khách sạn trực tuyến', expId: 1n, tech: 'Next.js, Spring Boot, SQL Server', isBank: 0, createdBy: 2351170611n }, // Đề tài do sinh viên tự đề xuất
  ];

  for (let index = 0; index < danhSachDeTai.length; index++) {
    const nextTopicId = 1n + BigInt(index);
    const tp = danhSachDeTai[index];

    await prisma.topic.upsert({
      where: { topic_id: nextTopicId },
      update: {},
      create: {
        topic_id: nextTopicId,
        expertise_id: tp.expId,
        created_by: tp.createdBy,
        title: tp.title,
        description: `Mô tả chi tiết và yêu cầu kỹ thuật cho đề tài: ${tp.title}`,
        technologies: tp.tech,
        is_bank_topic: tp.isBank === 1,
        is_available: true, // Mặc định còn trống
        status: tp.isBank === 1 ? 'APPROVED' : 'PENDING', // Đề tài SV đề xuất để trạng thái chờ duyệt
      },
    });
  }

  // ==========================================
  // 10. Tạo Hội đồng Bảo vệ (Councils)
  // ==========================================
  const danhSachHoiDong = [
    { name: 'Hội đồng số 1 - Chuyên ngành Hệ thống thông tin', room: 'Phòng 302', bld: 'Tòa nhà B1' },
    { name: 'Hội đồng số 2 - Chuyên ngành Kỹ thuật phần mềm', room: 'Phòng 405', bld: 'Tòa nhà C1' },
  ];

  // Set ngày bảo vệ thử nghiệm vào cuối học kỳ 8 mẫu
  const defenseStart = new Date(baseDate);
  defenseStart.setMonth(defenseStart.getMonth() + 4); // Sau 4 tháng làm đồ án
  const defenseEnd = new Date(defenseStart);
  defenseEnd.setHours(defenseEnd.getHours() + 4); // Buổi bảo vệ kéo dài 4 tiếng

  for (let index = 0; index < danhSachHoiDong.length; index++) {
    const nextCouncilId = 1n + BigInt(index);
    const cc = danhSachHoiDong[index];

    await prisma.council.upsert({
      where: { council_id: nextCouncilId },
      update: {},
      create: {
        council_id: nextCouncilId,
        semester_id: 8n,
        name: cc.name,
        buildings: cc.bld,
        rooms: cc.room,
        start_date: defenseStart,
        end_date: defenseEnd,
      },
    });
  }

  // ==========================================
  // 11. Thành viên Hội đồng (CouncilMembers)
  // ==========================================
  // Hội đồng 1 gán các GV: 1001 (Chủ tịch), 1002 (Thư ký), 1003 (Phản biện)
  // Hội đồng 2 gán các GV: 1004 (Chủ tịch), 1005 (Thư ký), 1006 (Phản biện)
  const phânChứcVụ = [
    { councilId: 1n, lecturerId: 1001n, pos: 'chairman' },
    { councilId: 1n, lecturerId: 1002n, pos: 'secretary' },
    { councilId: 1n, lecturerId: 1003n, pos: 'reviewer' },
    { councilId: 2n, lecturerId: 1004n, pos: 'chairman' },
    { councilId: 2n, lecturerId: 1005n, pos: 'secretary' },
    { councilId: 2n, lecturerId: 1006n, pos: 'reviewer' },
  ];

  for (let index = 0; index < phânChứcVụ.length; index++) {
    const member = phânChứcVụ[index];
    await prisma.councilMember.upsert({
      where: {
        council_id_lecturer_id: {
          council_id: member.councilId,
          lecturer_id: member.lecturerId,
        }
      },
      update: {},
      create: {
        council_id: member.councilId,
        lecturer_id: member.lecturerId,
        position: member.pos,
      }
    });
  }

  // ==========================================
  // 12. Hồ sơ Đồ án Tốt nghiệp (Capstones)
  // ==========================================
  // Tiến hành gán 5 sinh viên (2351170611n -> 2351170615n) làm 5 đề tài vừa tạo ở trên
  for (let i = 1; i <= 5; i++) {
    const currentStudentId = 2351170610n + BigInt(i);
    const currentTopicId = BigInt(i);
    // Gán xoay vòng GV hướng dẫn từ 1001n -> 1003n
    const currentLecturerId = 1000n + BigInt((i % 3) + 1);
    // Đứa thứ 1, 2, 3 gán vào hội đồng 1, đứa thứ 4, 5 gán hội đồng 2
    const currentCouncilId = i <= 3 ? 1n : 2n;

    await prisma.capstone.upsert({
      where: { capstone_id: BigInt(i) },
      update: {},
      create: {
        capstone_id: BigInt(i),
        student_id: currentStudentId,
        topic_id: currentTopicId,
        lecturer_id: currentLecturerId,
        semester_id: 8n, // Thuộc học kỳ đồ án (8)
        council_id: currentCouncilId,
        status: CapstoneStatus.DOING, // Trạng thái đang thực hiện đồ án mẫu
        student_message: 'Em chào thầy/cô, em xin đăng ký thực hiện đề tài này ạ!',
        lecturer_feedback: 'Đề tài tốt, cần tập trung làm rõ phần thiết kế hệ thống nhé.',
        final_report_path: i === 5 ? null : `/uploads/reports/capstone_${i}_final.pdf`, // Sinh viên 5 chưa nộp bản cuối
        instructor_grade: parseFloat((3.0 + Math.random()).toFixed(2)), // Tự sinh điểm hướng dẫn 3.0 -> 4.0
        council_grade: parseFloat((3.0 + Math.random()).toFixed(2)),      // Tự sinh điểm hội đồng
        defense_order: i, // Số thứ tự lên thớt thuyết trình
      },
    });

    // Cập nhật lại đề tài này thành 'Đã có người chọn' (is_available = 0)
    await prisma.topic.update({
      where: { topic_id: currentTopicId },
      data: { is_available: false },
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