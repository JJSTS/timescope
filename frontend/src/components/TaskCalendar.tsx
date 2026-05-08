import React, { useState } from 'react';
import '../styles/TaskCalendar.css';

interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  proyecto?: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
}

interface TaskCalendarProps {
  tasks: Task[];
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (day: number) => {
    return tasks.filter((task) => {
      if (!task.fechaLimite) return false;
      const taskDate = new Date(task.fechaLimite);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = [];

  // Agregar días vacíos del mes anterior
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Agregar días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={previousMonth}>
          ◀
        </button>
        <h3 className="calendar-month-year">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          ▶
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          const dayTasks = day ? getTasksForDate(day) : [];
          const isToday =
            isCurrentMonth &&
            day === today.getDate();

          return (
            <div
              key={index}
              className={`calendar-day ${day ? 'active' : 'empty'} ${
                isToday ? 'today' : ''
              } ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>
                  {dayTasks.length > 0 && (
                    <div className="day-tasks-list">
                      {dayTasks.map((task) => {
                        const taskDate = task.fechaLimite ? new Date(task.fechaLimite) : null;
                        const formattedDate = taskDate ?
                          taskDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                          : '';

                        return (
                          <div
                            key={task.id}
                            className={`task-item task-${task.estado?.toLowerCase() || 'pendiente'}`}
                            title={`${task.nombre} - ${formattedDate}`}
                          >
                            <span className="task-name">{task.nombre}</span>
                            {formattedDate && <span className="task-date">{formattedDate}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda de estados */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot task-activo"></span>
          <span>Activo</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot task-completado"></span>
          <span>Completado</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot task-pendiente"></span>
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;

