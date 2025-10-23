// utils/disponibilidadStaff.js
// Genera los bloques de tiempo disponibles y ocupados para un staff

const staffBaseSchedule = require('../models/staffSchedule');
const Cita = require('../models/Cita');

function getDateBlocks(startDate, endDate, days, startHour, endHour, slotMinutes) {
  const blocks = [];
  // Normalizar a medianoche local
  const toLocalMidnight = (d) => {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day, 0, 0, 0, 0);
    }
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
  };

  let current = toLocalMidnight(startDate);
  const last = toLocalMidnight(endDate);
  while (current <= last) {
    if (days.includes(current.getDay())) {
      for (let h = startHour; h < endHour; h += slotMinutes / 60) {
        const year = current.getFullYear();
        const month = current.getMonth();
        const date = current.getDate();
        const blockStart = new Date(year, month, date, Math.floor(h), (h % 1) ? ( (h % 1) * 60 ) : 0, 0, 0);
        const blockEnd = new Date(blockStart.getTime() + slotMinutes * 60000);
        blocks.push({ start: blockStart, end: blockEnd });
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
