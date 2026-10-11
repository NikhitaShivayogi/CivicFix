const generateReportId = async (Report) => {
  const lastReport = await Report.findOne({}).sort({ createdAt: -1 }).lean();

  let nextNumber = 1;

  if (lastReport && lastReport.reportId) {
    const lastNumber = Number(lastReport.reportId.split('-').pop());
    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const year = new Date().getFullYear();
  return `CF-${year}-${String(nextNumber).padStart(6, '0')}`;
};

module.exports = generateReportId;
