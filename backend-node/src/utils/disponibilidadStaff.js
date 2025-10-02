// utils/disponibilidadStaff.js
// Genera los bloques de tiempo disponibles y ocupados para un staff

const staffBaseSchedule = require('../models/staffSchedule');
const Cita = require('../models/Cita');

function getDateBlocks(startDate, endDate, days, startHour, endHour, slotMinutes) {
  const blocks = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    if (days.includes(current.getDay())) {
      for (let h = startHour; h < endHour; h += slotMinutes / 60) {
        const blockStart = new Date(current);
        blockStart.setHours(h, 0, 0, 0);
        const blockEnd = new Date(blockStart);
        blockEnd.setMinutes(blockEnd.getMinutes() + slotMinutes);
        blocks.push({ start: new Date(blockStart), end: new Date(blockEnd) });
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return blocks;
}

async function getStaffDisponibilidad(staffId, desde, hasta) {
  const config = staffBaseSchedule[staffId];
  if (!config) return { error: 'Horario base no definido para este staff' };
  const { days, startHour, endHour, slotMinutes } = config;
  // Generar todos los bloques posibles
  const bloques = getDateBlocks(desde, hasta, days, startHour, endHour, slotMinutes);
  // Obtener citas ocupadas
  const ocupadas = await Cita.getStaffOcupadoConfirmadas(staffId);
  // Marcar ocupados
  const disponibilidad = bloques.map(b => {
    const ocupado = ocupadas.some(o => {
      const oStart = new Date(o.fecha);
      const oEnd = new Date(o.end_time);
      return b.start < oEnd && b.end > oStart;
    });
    return { ...b, ocupado };
  });
  return disponibilidad;
}

module.exports = { getStaffDisponibilidad };
