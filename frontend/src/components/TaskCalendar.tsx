import React, { useState } from 'react';
import TaskDetailModal from './TaskDetailModal'; // Importar el nuevo modal
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

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

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

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  
  const days = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={previousMonth}>◀</button>
        <h3 className="calendar-month-year">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button className="calendar-nav-btn" onClick={nextMonth}>▶</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day) => <div key={day} className="weekday">{day}</div>)}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          const dayTasks = day ? getTasksForDate(day) : [];
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div key={index} className={`calendar-day ${day ? 'active' : 'empty'} ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}>
              {day && (
                <>
                  <div className="day-number">{day}</div>
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
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      <div className="calendar-legend">
        <div className="legend-item"><span className="legend-dot task-activo"></span><span>Activo</span></div>
        <div className="legend-item"><span className="legend-dot task-abierto"></span><span>Abierto</span></div>
      </div>
    </div>
  );
};

export default TaskCalendar;
