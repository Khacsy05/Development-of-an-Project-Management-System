import bcrypt from 'bcryptjs';
import { CapstoneStatus, CouncilPosition, PrismaClient, RequestStatus, SubmissionStatus, UserRole } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const url = new URL(dbUrl);
// Nếu kết nối qua cloud (khác localhost/127.0.0.1) thì bắt buộc bật SSL
const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
const ssl = isLocal ? undefined : { rejectUnauthorized: true };

const adapter = new PrismaMariaDb({
  host: url.hostname || 'localhost',
  port: url.port ? parseInt(url.port) : 3306,
  user: decodeURIComponent(url.username) || 'root',
  password: decodeURIComponent(url.password) || undefined,
  database: decodeURIComponent(url.pathname.substring(1)),
  ssl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu dọn dẹp và seed dữ liệu mới...');

  // 1. Tránh khóa ngoại bằng cách xóa theo thứ tự phụ thuộc ngược
  await prisma.councilEvaluation.deleteMany({});
  await prisma.councilMember.deleteMany({});
  await prisma.capstoneSubmission.deleteMany({});
  await prisma.capstoneRequest.deleteMany({});
  await prisma.capstone.deleteMany({});
  await prisma.council.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.lecturerExpertise.deleteMany({});
  await prisma.expertise.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.semester.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.major.deleteMany({});

  // Set dean_id to null first to avoid circular reference on delete
  await prisma.faculty.updateMany({ data: { dean_id: null } });
  await prisma.user.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('🧹 Đã dọn dẹp sạch sẽ cơ sở dữ liệu.');

  // ==========================================
  // 1. Tạo các Vai trò (Role)
  // ==========================================
  const adminRole = await prisma.role.create({
    data: { role_id: 1n, role_name: UserRole.Admin }
  });
  const lecturerRole = await prisma.role.create({
    data: { role_id: 2n, role_name: UserRole.Lecturer }
  });
  const studentRole = await prisma.role.create({
    data: { role_id: 3n, role_name: UserRole.Student }
  });

  const hashedPassword = await bcrypt.hash('password_da_ma_hoa_cho_nay', 10);

  // ==========================================
  // 2. Tạo các Khoa (Faculty)
  // ==========================================
  const danhSachFaculty = [
    { faculty_id: 1000n, faculty_code: 'CNTT', name: 'Khoa Công nghệ thông tin' },
    { faculty_id: 1001n, faculty_code: 'CT', name: 'Khoa Công trình' },
    { faculty_id: 1002n, faculty_code: 'KT', name: 'Khoa Kinh tế' },
    { faculty_id: 1003n, faculty_code: 'CK', name: 'Khoa Cơ Khí' },
  ];

  for (const f of danhSachFaculty) {
    await prisma.faculty.create({ data: f });
  }

  // ==========================================
  // 3. Tạo tài khoản Giảng viên (User)
  // ==========================================
  // Tạo 15 giảng viên cho khoa CNTT để phân công hội đồng phong phú
  const lecturers: any[] = [];
  for (let i = 1; i <= 15; i++) {
    const userId = 1000n + BigInt(i);
    const usercode = `GV${String(i).padStart(3, '0')}`;
    const username = `gv_giangvien${i}`;
    const lec = await prisma.user.create({
      data: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: hashedPassword,
        email: `giangvien${i}@tlu.edu.vn`,
        fullname: `Giảng Viên ${i}`,
        role_id: lecturerRole.role_id,
        faculty_id: 1000n,
      }
    });
    lecturers.push(lec);
  }

  // Gán GV001 (user_id: 1001n) làm Trưởng khoa CNTT
  await prisma.faculty.update({
    where: { faculty_id: 1000n },
    data: { dean_id: 1001n }
  });

  // Tạo tài khoản Admin tối cao
  await prisma.user.create({
    data: {
      user_id: 1n,
      usercode: "ADMIN001",
      username: "admin",
      password: hashedPassword,
      email: "admin@tlu.edu.vn",
      fullname: "Quản trị viên hệ thống",
      role_id: adminRole.role_id,
    }
  });

  // ==========================================
  // 4. Tạo Chuyên ngành và Lớp học
  // ==========================================
  const majors = [
    { id: 1n, name: 'Hệ thống thông tin' },
    { id: 2n, name: 'Kỹ thuật phần mềm' },
    { id: 3n, name: 'Khoa học máy tính' },
    { id: 4n, name: 'An toàn thông tin' },
  ];

  for (const m of majors) {
    await prisma.major.create({
      data: {
        major_id: m.id,
        major_name: m.name,
        faculty_id: 1000n,
      }
    });
  }

  const classes = [
    { id: 1n, name: '65HTTT1', majorId: 1n, lecturerId: 1001n },
    { id: 2n, name: '65KTPM1', majorId: 2n, lecturerId: 1002n },
    { id: 3n, name: '65KHMT1', majorId: 3n, lecturerId: 1003n },
    { id: 4n, name: '65ATTT1', majorId: 4n, lecturerId: 1004n },
    { id: 5n, name: '65CNTT1', majorId: 2n, lecturerId: 1005n },
  ];

  for (const c of classes) {
    await prisma.class.create({
      data: {
        class_id: c.id,
        class_name: c.name,
        major_id: c.majorId,
        lecturer_id: c.lecturerId,
        faculty_id: 1000n,
      }
    });
  }

  // ==========================================
  // 5. Tạo 60 tài khoản Sinh viên & Profile
  // ==========================================
  const students: any[] = [];
  for (let i = 1; i <= 60; i++) {
    const userId = 2351170000n + BigInt(i);
    const usercode = `SV${String(i).padStart(3, '0')}`;
    const username = `sv_sinhvien${i}`;
    const stu = await prisma.user.create({
      data: {
        user_id: userId,
        usercode: usercode,
        username: username,
        password: hashedPassword,
        email: `student${i}@e.tlu.edu.vn`,
        fullname: `Sinh Viên ${i}`,
        role_id: studentRole.role_id,
        faculty_id: 1000n,
      }
    });
    students.push(stu);

    const randomClassId = BigInt((i % 5) + 1);
    const randomGPA = parseFloat((2.5 + Math.random() * 1.4).toFixed(2));
    await prisma.studentProfile.create({
      data: {
        user_id: userId,
        class_id: randomClassId,
        gpa: randomGPA,
      }
    });
  }

  // ==========================================
  // 6. Tạo Năm học & Học kỳ
  // ==========================================
  const year2526 = await prisma.academicYear.create({
    data: {
      year_id: 3n,
      year_name: '2025-2026',
      start_year: 2025,
      end_year: 2026,
    }
  });

  const semester8 = await prisma.semester.create({
    data: {
      semester_id: 8n,
      year_id: year2526.year_id,
      semester_name: 'Học kỳ 8',
      start_date: new Date('2027-02-01T00:00:00Z'),
      end_date: new Date('2027-06-30T23:59:59Z'),
    }
  });

  // ==========================================
  // 7. Tạo Mốc thời gian nộp bài (Milestones)
  // ==========================================
  const milestonesData = [
    { milestone_id: 1n, phase_name: 'Nộp đề cương sơ bộ', days: 15, desc: 'Nộp file PDF đề cương đồ án có chữ ký GVHD.' },
    { milestone_id: 2n, phase_name: 'Báo cáo tiến độ lần 1', days: 45, desc: 'Báo cáo tiến độ hoàn thành 30% khối lượng công việc.' },
    { milestone_id: 3n, phase_name: 'Báo cáo tiến độ lần 2', days: 75, desc: 'Báo cáo tiến độ hoàn thành 70% khối lượng công việc.' },
    { milestone_id: 4n, phase_name: 'Nộp báo cáo cuối cùng', days: 105, desc: 'Nộp toàn bộ source code lên GitHub và file báo cáo bản cứng.' },
  ];

  const baseDate = new Date(semester8.start_date);
  for (const ms of milestonesData) {
    const deadlineDate = new Date(baseDate);
    deadlineDate.setDate(deadlineDate.getDate() + ms.days);
    await prisma.milestone.create({
      data: {
        milestone_id: ms.milestone_id,
        semester_id: semester8.semester_id,
        phase_name: ms.phase_name,
        description: ms.desc,
        deadline: deadlineDate,
      }
    });
  }

  // ==========================================
  // 8. Tạo Chuyên ngành chuyên môn (Expertise)
  // ==========================================
  const chuyenMon = [
    { id: 1n, name: 'Web Development', desc: 'Phát triển ứng dụng Web NodeJS/Laravel/Java...' },
    { id: 2n, name: 'AI & Machine Learning', desc: 'Trí tuệ nhân tạo, xử lý hình ảnh, NLP...' },
    { id: 3n, name: 'Mobile App Development', desc: 'Ứng dụng di động Flutter/React Native...' },
    { id: 4n, name: 'Cloud & DevOps', desc: 'Triển khai Docker, Kubernetes, CI/CD...' },
  ];

  for (const cm of chuyenMon) {
    await prisma.expertise.create({
      data: {
        expertise_id: cm.id,
        name: cm.name,
        description: cm.desc,
      }
    });
  }

  // Gán chuyên môn cho 15 giảng viên
  for (let i = 1; i <= 15; i++) {
    const currentLecturerId = 1000n + BigInt(i);
    const expId = BigInt((i % 4) + 1);
    await prisma.lecturerExpertise.create({
      data: {
        lecturer_id: currentLecturerId,
        expertise_id: expId,
      }
    });
  }

  // ==========================================
  // 9. Tạo 40 Đề tài (Topics)
  // ==========================================
  const topics: any[] = [];
  const topicTitles = [
    'Hệ thống quản lý thực tập tốt nghiệp IPMS', 'Phần mềm điểm danh tự động bằng FaceID',
    'Ứng dụng theo dõi sức khỏe kết nối IoT', 'Công cụ tự động hóa CI/CD cho Microservices',
    'Ví điện tử tích hợp thanh toán mã QR', 'Website đấu giá trực tuyến thời gian thực',
    'Hệ thống gợi ý khóa học thông minh AI', 'Mạng xã hội nội bộ cho doanh nghiệp',
    'Quản lý kho hàng thông minh bằng RFID', 'Chatbot tư vấn tuyển sinh Đại học',
    'Hệ thống giám sát giao thông qua Camera AI', 'Ứng dụng đặt đồ ăn trực tuyến GrabFood clone',
    'Sàn giao dịch bất động sản tích hợp bản đồ', 'Phần mềm quản lý phòng khám đa khoa',
    'Ứng dụng học tiếng Anh qua Flashcard AI', 'Cổng thanh toán bảo mật đa chuỗi BlockChain',
    'Hệ thống lập lịch dạy học tự động cho trường học', 'Website quản lý thư viện số và mượn sách',
    'Ứng dụng ký số văn bản điện tử bảo mật', 'Nền tảng Livestream bán hàng tích hợp giỏ hàng',
    'Công cụ phân tích cảm xúc khách hàng Social Media', 'Ứng dụng tìm kiếm phòng trọ sinh viên',
    'Hệ thống quản lý bán vé xe khách trực tuyến', 'Website thương mại điện tử thời trang đa kênh',
    'Ứng dụng chia sẻ xe đi chung đường dài', 'Hệ thống cảnh báo cháy nổ tự động qua cảm biến',
    'Website học trực tuyến Udemy clone', 'Phần mềm quản lý phòng tập Gym và Yoga',
    'Ứng dụng quét mã vạch kiểm tra nguồn gốc sản phẩm', 'Hệ thống bầu cử trực tuyến dựa trên mã hóa OTP',
    'Ứng dụng đặt lịch sửa chữa xe tại nhà', 'Hệ thống quản lý rác thải đô thị thông minh',
    'Website kết nối gia sư và học sinh trực tuyến', 'Phần mềm quản lý tiệm vàng bạc đá quý',
    'Ứng dụng theo dõi lượng nước tiêu thụ hộ gia đình', 'Hệ thống định vị xe buýt trường học theo thời gian thực',
    'Mạng xã hội tìm kiếm bạn cùng phòng ký túc xá', 'Website tuyển dụng việc làm IT chuyên sâu',
    'Hệ thống chấm điểm code tự động CodeForces clone', 'Ứng dụng đọc truyện tranh trực tuyến có bản quyền'
  ];

  for (let i = 1; i <= 60; i++) {
    const creatorId = 1000n + BigInt((i % 15) + 1); // Chia đều người tạo trong 15 GV
    const expId = BigInt((i % 4) + 1);
    const isBank = i <= 55; // 55 đề tài ngân hàng, 5 đề tài do sinh viên tự đề xuất
    const title = topicTitles[i - 1] || `Đề tài nghiên cứu ứng dụng công nghệ số ${i}`;
    const tp = await prisma.topic.create({
      data: {
        topic_id: BigInt(i),
        expertise_id: expId,
        created_by: isBank ? creatorId : 2351170000n + BigInt((i % 10) + 1), // SV đề xuất
        faculty_id: 1000n,
        title: title,
        description: `Yêu cầu chi tiết và mô tả nghiệp vụ của đề tài: ${title}`,
        technologies: 'React, Node.js, Express, MySQL, Docker',
        is_bank_topic: isBank,
        is_available: true,
        status: isBank ? 'APPROVED' : 'PENDING',
      }
    });
    topics.push(tp);
  }

  // ==========================================
  // 10. Tạo 5 Hội đồng bảo vệ (Councils)
  // ==========================================
  const councils: any[] = [];
  const roomNames = ['Phòng 301-B1', 'Phòng 402-C1', 'Phòng 505-A5', 'Phòng 102-T4', 'Phòng 303-B2'];
  for (let i = 1; i <= 5; i++) {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + 110);
    const end = new Date(start);
    end.setHours(end.getHours() + 4);

    const cc = await prisma.council.create({
      data: {
        council_id: BigInt(i),
        semester_id: semester8.semester_id,
        name: `Hội đồng Chấm đồ án CNTT số ${i}`,
        buildings: 'Khu giảng đường chính TLU',
        rooms: roomNames[i - 1],
        faculty_id: 1000n,
        start_date: start,
        end_date: end,
      }
    });
    councils.push(cc);
  }

  // Phân công thành viên cho 5 hội đồng (mỗi HĐ 3 người: Chủ tịch, Thư ký, Phản biện)
  const CM_Lecturers = [
    [1001n, 1002n, 1003n], // HĐ 1
    [1004n, 1005n, 1006n], // HĐ 2
    [1007n, 1008n, 1009n], // HĐ 3
    [1010n, 1011n, 1012n], // HĐ 4
    [1013n, 1014n, 1015n], // HĐ 5
  ];

  for (let i = 0; i < 5; i++) {
    const councilId = BigInt(i + 1);
    const [cId, sId, rId] = CM_Lecturers[i];

    await prisma.councilMember.create({
      data: { council_id: councilId, lecturer_id: cId, position: CouncilPosition.CHAIRMAN }
    });
    await prisma.councilMember.create({
      data: { council_id: councilId, lecturer_id: sId, position: CouncilPosition.SECRETARY }
    });
    await prisma.councilMember.create({
      data: { council_id: councilId, lecturer_id: rId, position: CouncilPosition.REVIEWER }
    });
  }

  // ==========================================
  // 11. Tạo 45 Đồ án (Capstones) với các trạng thái phong phú
  // ==========================================
  // Chúng ta có 60 sinh viên (2351170001 -> 2351170060).
  // Gán đồ án cho 45 sinh viên đầu tiên.
  for (let i = 1; i <= 45; i++) {
    const studentId = 2351170000n + BigInt(i);
    let status: CapstoneStatus = CapstoneStatus.DOING;
    let lecturerId: bigint | null = 1000n + BigInt((i % 15) + 1); // GV hướng dẫn xoay vòng
    let topicId: bigint | null = BigInt(i);

    const targetLecId = lecturerId;
    const targetTopicId = topicId;

    // Phân bổ trạng thái đồ án sinh động:
    if (i <= 5) {
      status = CapstoneStatus.PENDING_LECTURER; // Đang chờ GV duyệt đăng ký
      lecturerId = null;
      topicId = null;
    } else if (i <= 8) {
      status = CapstoneStatus.PENDING_FACULTY; // Đang chờ Khoa duyệt đề tài SV đề xuất
      topicId = null;
    } else if (i <= 20) {
      status = CapstoneStatus.DOING; // Đang thực hiện bình thường
    } else if (i <= 32) {
      status = CapstoneStatus.DEFENSE_ELIGIBLE; // Đủ điều kiện ra hội đồng bảo vệ
    } else if (i <= 42) {
      status = CapstoneStatus.COMPLETED; // Đã bảo vệ thành công
    } else if (i === 43 || i === 44) {
      status = CapstoneStatus.FAILED; // Bị trượt
    } else {
      status = CapstoneStatus.CANCEL; // Đã hủy
    }

    // Set điểm số cho các trạng thái phù hợp
    let instructorGrade: number | null = null;
    let councilGrade: number | null = null;
    let councilId: bigint | null = null;

    if (status === CapstoneStatus.DEFENSE_ELIGIBLE) {
      instructorGrade = 8.0 + (i % 3) * 0.5; // Điểm GVHD chấm từ 8.0 -> 9.0
    } else if (status === CapstoneStatus.COMPLETED) {
      instructorGrade = 8.5;
      councilGrade = 8.0 + (i % 3) * 0.5;
      councilId = BigInt((i % 5) + 1); // Gán vào 1 trong 5 hội đồng bảo vệ
    } else if (status === CapstoneStatus.FAILED) {
      instructorGrade = 4.0;
      councilGrade = 3.5;
      councilId = 1n;
    }

    const cap = await prisma.capstone.create({
      data: {
        capstone_id: BigInt(i),
        student_id: studentId,
        topic_id: topicId,
        lecturer_id: lecturerId,
        semester_id: semester8.semester_id,
        status: status,
        faculty_id: 1000n,
        instructor_grade: instructorGrade,
        council_grade: councilGrade,
        council_id: councilId,
      }
    });

    // Tạo các yêu cầu đăng ký tương ứng (Requests) để hệ thống hiển thị lịch sử duyệt đề tài
    if (status === CapstoneStatus.PENDING_LECTURER) {
      await prisma.capstoneRequest.create({
        data: {
          capstone_id: cap.capstone_id,
          sender_id: studentId,
          request_type: 'REGISTER_LECTURER',
          message: 'Em chào thầy/cô, em mong muốn được đăng ký thầy/cô hướng dẫn thực hiện đề tài tốt nghiệp này ạ.',
          target_id: targetLecId,
          status: RequestStatus.PENDING,
        }
      });
    } else if (status === CapstoneStatus.PENDING_FACULTY) {
      await prisma.capstoneRequest.create({
        data: {
          capstone_id: cap.capstone_id,
          sender_id: studentId,
          request_type: 'REGISTER_TOPIC',
          message: 'Hồ sơ đề xuất đề tài tốt nghiệp tự chọn của sinh viên gửi Khoa phê duyệt.',
          target_id: targetTopicId,
          status: RequestStatus.PENDING,
        }
      });
    }

    // Tạo lịch sử nộp bài (Milestone Submissions) cho các Capstones đang thực hiện và đã hoàn thành
    if (status === CapstoneStatus.DOING || status === CapstoneStatus.DEFENSE_ELIGIBLE || status === CapstoneStatus.COMPLETED || status === CapstoneStatus.FAILED) {
      // Mốc 1: Nộp đề cương sơ bộ -> Mọi người đều đã hoàn thành và đạt
      await prisma.capstoneSubmission.create({
        data: {
          capstone_id: cap.capstone_id,
          milestone_id: 1n,
          file_path: `/uploads/submissions/de_cuong_sv_${i}.pdf`,
          student_note: 'Bản nộp đề cương chi tiết giai đoạn 1',
          grade: 8.5,
          lecturer_note: 'Đề cương tốt, tiếp tục phát triển.',
          status: SubmissionStatus.PASSED,
        }
      });

      // Mốc 2: Báo cáo tiến độ lần 1 -> Đã hoàn thành và đạt
      await prisma.capstoneSubmission.create({
        data: {
          capstone_id: cap.capstone_id,
          milestone_id: 2n,
          file_path: `/uploads/submissions/tien_do_1_sv_${i}.pdf`,
          student_note: 'Nộp báo cáo tiến độ lần 1',
          grade: 8.0,
          lecturer_note: 'Đã hoàn thành đúng tiến độ.',
          status: SubmissionStatus.PASSED,
        }
      });

      // Mốc 3: Báo cáo tiến độ lần 2 -> Đã hoàn thành cho những capstones gần cuối
      if (status === CapstoneStatus.DEFENSE_ELIGIBLE || status === CapstoneStatus.COMPLETED || status === CapstoneStatus.FAILED) {
        await prisma.capstoneSubmission.create({
          data: {
            capstone_id: cap.capstone_id,
            milestone_id: 3n,
            file_path: `/uploads/submissions/tien_do_2_sv_${i}.pdf`,
            student_note: 'Nộp báo cáo tiến độ lần 2',
            grade: 8.0,
            lecturer_note: 'Hoàn thành tốt phần Core chính của ứng dụng.',
            status: SubmissionStatus.PASSED,
          }
        });
      }

      // Mốc 4: Báo cáo cuối kỳ -> Chỉ những capstones chuẩn bị hoặc đã bảo vệ mới nộp
      if (status === CapstoneStatus.DEFENSE_ELIGIBLE || status === CapstoneStatus.COMPLETED || status === CapstoneStatus.FAILED) {
        await prisma.capstoneSubmission.create({
          data: {
            capstone_id: cap.capstone_id,
            milestone_id: 4n,
            file_path: `/uploads/submissions/bao_cao_cuoi_ky_sv_${i}.zip`,
            student_note: 'Em nộp báo cáo hoàn thiện kèm link github source code.',
            grade: status === CapstoneStatus.FAILED ? 4.0 : 8.5,
            lecturer_note: status === CapstoneStatus.FAILED ? 'Báo cáo sơ sài, thiếu nhiều chức năng lớn.' : 'Báo cáo đầy đủ, đạt yêu cầu để ra hội đồng bảo vệ.',
            status: status === CapstoneStatus.FAILED ? SubmissionStatus.FAILED : SubmissionStatus.PASSED,
          }
        });
      }
    }

    // Tạo phiếu chấm điểm Hội đồng (CouncilEvaluation) cho các đồ án đã bảo vệ xong
    if ((status === CapstoneStatus.COMPLETED || status === CapstoneStatus.FAILED) && councilId) {
      const evaluationLecturers = CM_Lecturers[Number(councilId) - 1]; // Lấy danh sách 3 giảng viên hội đồng
      for (const evaluatorId of evaluationLecturers) {
        const gradeOffset = (Number(evaluatorId) % 3) * 0.5;
        await prisma.councilEvaluation.create({
          data: {
            council_id: councilId,
            members_id: evaluatorId,
            capstone_id: cap.capstone_id,
            grade: status === CapstoneStatus.FAILED ? 3.5 : 8.0 + gradeOffset,
            lecturer_note: status === CapstoneStatus.FAILED ? 'Đồ án không đạt chất lượng tối thiểu.' : 'Phần trình bày tự tin, trả lời tốt câu hỏi phản biện.',
          }
        });
      }
    }
  }

  console.log('✅ Seed dữ liệu phong phú thành công!');
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