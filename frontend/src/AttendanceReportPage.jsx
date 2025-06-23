import React from 'react';
import { useAttendanceReport } from './hooks/useAttendanceReport';

// --- Child Components ---

const FilterForm = ({ filters, setFilters, students, onSubmit, loading, formError }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  };

  return (
    <form onSubmit={onSubmit} className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">查詢方式</label>
          <select
            id="filterType"
            name="type"
            value={filters.type}
            onChange={handleTypeChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="dateRange">依日期範圍</option>
            <option value="month">依月份</option>
            <option value="student">依學生</option>
          </select>
        </div>

        {filters.type === 'dateRange' && (
          <>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
              <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
              <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </>
        )}

        {filters.type === 'month' && (
          <div className="md:col-span-2">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">選擇月份</label>
            <input type="month" id="month" name="month" value={filters.month} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
        )}

        {filters.type === 'student' && (
          <div className="md:col-span-2">
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">選擇學生</label>
            <select id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">-- 請選擇學生 --</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? '查詢中...' : '查詢'}
          </button>
        </div>
      </div>
      {formError && <p className="text-red-500 mt-4 text-center">{formError}</p>}
    </form>
  );
};

const ReportTable = ({ records, loading, searchMessage }) => {
  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4">載入中...</td>
        </tr>
      );
    }
    if (records.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4">{searchMessage || '請選擇條件並點擊查詢'}</td>
        </tr>
      );
    }
    return records.map(record => (
      <tr key={record._id} className="border-b hover:bg-gray-100">
        <td className="text-left py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
        <td className="text-left py-3 px-4">{record.course?.name || 'N/A'}</td>
        <td className="text-left py-3 px-4">{record.student?.name || 'N/A'}</td>
        <td className="text-left py-3 px-4">{record.status}</td>
      </tr>
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">日期</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">課程</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">學生</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">狀態</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {renderBody()}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        上一頁
      </button>
      <span className="text-gray-700">
        第 {currentPage} / {totalPages} 頁
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        下一頁
      </button>
    </div>
  );
};

// --- Main Component ---

const AttendanceReportPage = () => {
  const {
    filters,
    setFilters,
    students,
    reportData,
    loading,
    error,
    searchMessage,
    isExporting,
    handleFormSubmit,
    handlePageChange,
    handleExport,
  } = useAttendanceReport();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">點名紀錄查詢</h1>
        <button
          onClick={handleExport}
          disabled={isExporting || reportData.records.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isExporting ? '匯出中...' : '匯出 CSV'}
        </button>
      </div>
      
      <FilterForm
        filters={filters}
        setFilters={setFilters}
        students={students}
        onSubmit={handleFormSubmit}
        loading={loading}
        formError={error}
      />

      <ReportTable
        records={reportData.records}
        loading={loading}
        searchMessage={searchMessage || error}
      />

      <Pagination
        currentPage={reportData.currentPage}
        totalPages={reportData.totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

export default AttendanceReportPage;