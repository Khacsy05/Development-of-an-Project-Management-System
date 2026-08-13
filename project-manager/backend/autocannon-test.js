const { execSync } = require('child_process');

// Cấu hình URL và Tài khoản Test của bạn ở đây (sử dụng tài khoản Giảng viên để có quyền tạo lớp)
const BASE_URL = 'http://127.0.0.1:3001/api';
const TEST_ACCOUNT = {
  username: 'gv_giangvien1', // Tài khoản giảng viên
  password: 'password_da_ma_hoa_cho_nay'
};

async function startLoadTest() {
  console.log('==================================================');
  console.log('    BẮT ĐẦU CHƯƠNG TRÌNH TEST CHỊU TẢI API         ');
  console.log('==================================================\n');

  // 1. Kiểm tra xem autocannon đã được cài đặt chưa
  try {
    console.log('Đang kiểm tra môi trường...');
    execSync('npx autocannon -v', { stdio: 'ignore' });
  } catch (error) {
    console.log('==> Không tìm thấy Autocannon. Đang cài đặt thư viện tạm thời...');
    try {
      execSync('npm install --no-save autocannon', { stdio: 'inherit' });
      console.log('==> Đã cài đặt Autocannon thành công!\n');
    } catch (installErr) {
      console.error('Không thể cài đặt Autocannon. Vui lòng chạy lệnh: npm install -g autocannon');
      process.exit(1);
    }
  }

  // 2. Gọi API đăng nhập lấy JWT token
  let token = '';
  try {
    console.log(`Đang đăng nhập vào hệ thống (${BASE_URL}/auth/login)...`);

    // Sử dụng fetch tích hợp sẵn của Node.js (không cần cài thêm thư viện axios)
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_ACCOUNT)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    token = data.accessToken;
    console.log('==> Đăng nhập thành công! Đã lấy được Access Token.');
  } catch (loginErr) {
    console.error('\n❌ Đăng nhập thất bại:');
    console.error(loginErr.message);
    console.error('Vui lòng kiểm tra lại trạng thái Backend hoặc tài khoản TEST_ACCOUNT trong file này.\n');
    process.exit(1);
  }

  // 3. Thực thi Autocannon
  // Test API POST /api/classes để tạo lớp học mới
  const testUrl = `${BASE_URL}/classes`;
  const connections = 100; // 100 connections song song
  const duration = 10;
  
  // Dữ liệu tạo lớp học mới
  const postData = {
    class_name: 'Lớp Học Thử Nghiệm Tải',
    major_id: 1, // Mã ngành học (ngành HTTT)
    faculty_id: 1000, // Mã khoa (khoa CNTT)
    lecturer_id: 1001 // Mã giảng viên chủ nhiệm
  };
  const bodyString = JSON.stringify(postData).replace(/"/g, '\\"'); // Escaping quotes cho shell command

  console.log(`\nBắt đầu test chịu tải API POST: ${testUrl}`);
  console.log(`Cấu hình: ${connections} kết nối song song | Thời gian: ${duration} giây...\n`);

  try {
    // Chạy npx autocannon trực tiếp bằng child_process để hiển thị giao diện tiến trình
    const cmd = `npx autocannon -c ${connections} -d ${duration} -m POST -H "Authorization=Bearer ${token}" -H "Content-Type=application/json" -b "${bodyString}" ${testUrl}`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (testErr) {
    console.error('Đã xảy ra lỗi trong quá trình chạy test chịu tải:', testErr.message);
  }
}

startLoadTest();
