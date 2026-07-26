'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export default function CapstonesPage() {
  // Mock dữ liệu đề tài mẫu chuẩn từ Đại học Thủy Lợi (như trong ảnh chụp)
  const [topics, setTopics] = useState([
    { id: 1, code: 'DT01', title: 'Nhận diện vật thể', expertise: 'Computer Vision', technology: 'Yolov8', description: '65KTPM', status: 'Đã được đăng ký' },
    { id: 2, code: 'DT02', title: 'Hệ thống Quản lý Đồ án Tốt nghiệp', expertise: 'Web Development', technology: 'React, NestJS', description: '65CNPM', status: 'Đã được đăng ký' },
    { id: 3, code: 'DT03', title: 'Ứng dụng chatbot tư vấn tuyển sinh', expertise: 'Natural Language Processing', technology: 'GPT-4, Python', description: '65CNTT', status: 'Đã được đăng ký' },
    { id: 4, code: 'DT04', title: 'Phân tích dữ liệu điểm sinh viên', expertise: 'Data Science', technology: 'Python, Pandas', description: '65KTPM', status: 'Khả dụng' },
    { id: 5, code: 'DT05', title: 'Hệ thống IoT cảnh báo cháy sớm', expertise: 'Internet of Things', technology: 'Arduino, ESP32', description: '65KTPM', status: 'Khả dụng' },
    { id: 6, code: 'DT06', title: 'Triển khai hạ tầng đám mây cho E-learning', expertise: 'Cloud Computing', technology: 'Docker, AWS', description: '65KTPM', status: 'Khả dụng' },
  ]);

  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDelete = (id: number, title: string) => {
    toast.error(`Đã xóa đề tài: ${title}`);
    setTopics(topics.filter((t) => t.id !== id));
  };

  const handleEdit = (title: string) => {
    toast.info(`Mở bảng chỉnh sửa đề tài: ${title}`);
  };

  const handleAddTopic = () => {
    toast.success('Mở form thêm đề tài mới!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      
      {/* HEADER CỦA BẢNG */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight uppercase flex items-center gap-2.5">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
          Quản lý ngân hàng đề tài
        </h2>
        <button 
          onClick={handleAddTopic}
          className="flex items-center gap-2 bg-[#2e7d32] hover:bg-[#256428] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm đề tài
        </button>
      </div>

      {/* THANH BỘ LỌC TÌM KIẾM */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
        
        {/* Input Tìm Kiếm */}
        <div className="flex-1 min-w-[240px] relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tên đề tài..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Dropdown Công Nghệ */}
        <select 
          value={techFilter} 
          onChange={(e) => setTechFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="">Công nghệ</option>
          <option value="Yolov8">Yolov8</option>
          <option value="React">React, NestJS</option>
          <option value="Python">Python</option>
        </select>

        {/* Dropdown Chuyên Môn */}
        <select 
          value={expFilter} 
          onChange={(e) => setExpFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="">Chuyên môn</option>
          <option value="Vision">Computer Vision</option>
          <option value="Web">Web Development</option>
          <option value="AI">AI & NLP</option>
        </select>

        {/* Dropdown Trạng Thái */}
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="">Trạng thái</option>
          <option value="Đăng ký">Đã được đăng ký</option>
          <option value="Khả dụng">Khả dụng</option>
        </select>

        {/* Nút Tìm Kiếm */}
        <button 
          onClick={() => toast.success('Đang thực hiện lọc tìm kiếm đề tài...')}
          className="bg-[#8e24aa] hover:bg-[#7b1fa2] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200"
        >
          Tìm kiếm
        </button>
      </div>

      {/* BẢNG HIỂN THỊ DỮ LIỆU */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <th className="px-6 py-4 text-center w-16">STT</th>
              <th className="px-6 py-4 w-28">Mã đề tài</th>
              <th className="px-6 py-4">Tên đề tài</th>
              <th className="px-6 py-4">Chuyên môn</th>
              <th className="px-6 py-4">Công nghệ</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4 w-36">Trạng thái</th>
              <th className="px-6 py-4 text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {topics.map((topic, index) => (
              <tr key={topic.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-center font-medium text-gray-400">{index + 1}</td>
                <td className="px-6 py-4 font-mono font-semibold text-blue-600">{topic.code}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{topic.title}</td>
                <td className="px-6 py-4 text-gray-500">{topic.expertise}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-mono">{topic.technology}</span></td>
                <td className="px-6 py-4 text-gray-500">{topic.description}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    topic.status === 'Đã được đăng ký' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      topic.status === 'Đã được đăng ký' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></span>
                    {topic.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2.5">
                    {/* Nút Sửa */}
                    <button 
                      onClick={() => handleEdit(topic.title)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Sửa đề tài"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {/* Nút Xóa */}
                    <button 
                      onClick={() => handleDelete(topic.id, topic.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa đề tài"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG Ở DƯỚI BẢNG */}
      <div className="flex items-center justify-between mt-6">
        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50">3</button>
          <span className="px-1.5 text-xs text-gray-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50">8</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50">9</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50">10</button>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-all">
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}