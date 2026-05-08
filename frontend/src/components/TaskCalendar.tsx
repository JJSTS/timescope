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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
                      {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`task-item task-${task.estado?.toLowerCase() || 'pendiente'}`}
                            title={task.nombre}
                            onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                          >
                            <span className="task-name">{task.nombre}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal detalle de tarea */}
      {selectedTask && (
        <div className="task-modal-overlay" onClick={() => setSelectedTask(null)}>
          <div
            className={`task-modal task-modal-${selectedTask.estado?.toLowerCase() || 'pendiente'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="task-modal-close" onClick={() => setSelectedTask(null)}>✕</button>

            <div className="task-modal-header">
              <span className={`task-modal-badge task-${selectedTask.estado?.toLowerCase() || 'pendiente'}`}>
                {selectedTask.estado === 'ACTIVO' ? 'Activo'
                  : selectedTask.estado === 'COMPLETADO' ? 'Completado'
                  : selectedTask.estado === 'ABIERTO' ? 'Abierto'
                  : selectedTask.estado === 'SUSPENDIDO' ? 'Suspendido'
                  : selectedTask.estado}
              </span>
              <h3 className="task-modal-title">{selectedTask.nombre}</h3>
            </div>

            <div className="task-modal-body">
              {selectedTask.descripcion && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Descripción</span>
                  <p className="task-modal-value">{selectedTask.descripcion}</p>
                </div>
              )}
              {selectedTask.proyecto && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Proyecto</span>
                  <span className="task-modal-value">{selectedTask.proyecto}</span>
                </div>
              )}
              {selectedTask.horasEstimadas != null && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Horas estimadas</span>
                  <span className="task-modal-value">{selectedTask.horasEstimadas} h</span>
                </div>
              )}
              {selectedTask.fechaLimite && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Fecha límite</span>
                  <span className="task-modal-value">
                    {new Date(selectedTask.fechaLimite).toLocaleDateString('es-ES', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {selectedTask.fechaCreacion && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Fecha creación</span>
                  <span className="task-modal-value">
                    {new Date(selectedTask.fechaCreacion).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

