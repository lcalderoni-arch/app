// src/components/WeeklyCalendar.jsx
import React, { useMemo } from "react";
import "../styles/RolesStyle/Horario/HorarioSemanal.css";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// 🔧 SUBIMOS LA ALTURA POR HORA
const HOUR_HEIGHT = 64; // antes 48

function parseHoraToMinutes(horaStr) {
    if (!horaStr) return 0;
    const [h, m] = horaStr.split(":").map(Number);
    return h * 60 + (m || 0);
}

export default function WeeklyCalendar({
    events = [],
    startHour = 7,
    endHour = 22,
    weekLabel = "Semana actual",
}) {
    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
        hours.push(h);
    }

    const normalizedEvents = useMemo(() => {
        const baseMinutes = startHour * 60;

        return events.map((ev) => {
            const startMin = parseHoraToMinutes(ev.startTime) - baseMinutes;
            const safeStart = Math.max(0, startMin);

            return {
                ...ev,
                _top: (safeStart / 60) * HOUR_HEIGHT,
            };
        });
    }, [events, startHour]);


    return (
        <div className="horario-wrapper">
            <div className="horario-header-bar">
                <div className="horario-week-label">{weekLabel}</div>
                <div className="horario-view-buttons">
                    <button className="horario-view-btn active">Semana</button>
                    <button className="horario-view-btn" disabled>Mes</button>
                    <button className="horario-view-btn" disabled>Día</button>
                    <button className="horario-view-btn" disabled>Lista</button>
                </div>
            </div>

            <div className="horario-grid">
                {/* Columna horas */}
                <div className="horario-hours-col">
                    <div className="horario-hours-header" />
                    <div className="horario-hours-body">
                        {hours.map((h) => (
                            <div key={h} className="horario-hour-slot">
                                <span>{`${h.toString().padStart(2, "0")}:00`}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columnas por día */}
                <div className="horario-days">
                    {/* cabecera días */}
                    <div className="horario-days-header">
                        {DAYS.map((d, index) => (
                            <div key={d} className="horario-day-header">
                                <span className="day-short">{d}</span>
                                {/* Si quieres mostrar fecha, aquí podrías inyectar el número */}
                            </div>
                        ))}
                    </div>

                    {/* cuerpo con líneas y eventos */}
                    <div className="horario-days-body">
                        {DAYS.map((_, dayIndex) => {
                            const dayEvents = normalizedEvents.filter(
                                (ev) => ev.dayIndex === dayIndex
                            );
                            return (
                                <div
                                    key={`day-col-${dayIndex}`}
                                    className="horario-day-column"
                                >
                                    {/* líneas de horas */}
                                    {hours.map((h) => (
                                        <div
                                            key={`line-${dayIndex}-${h}`}
                                            className="horario-day-hour-line"
                                        />
                                    ))}

                                    {/* eventos */}
                                    {dayEvents.map((ev) => (
                                        <div
                                            key={`event-${ev.id}`}
                                            className="horario-event-card"
                                            style={{
                                                top: ev._top,
                                                height: ev._height,
                                            }}
                                        >
                                            <div className="event-time">
                                                {ev.startTime} - {ev.endTime}
                                            </div>
                                            <div className="event-title">{ev.title}</div>
                                            {ev.subtitle && (
                                                <div className="event-subtitle">{ev.subtitle}</div>
                                            )}
                                            {ev.aula && (
                                                <div className="event-aula">Aula: {ev.aula}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <p className="horario-legend">
                <strong>Tip:</strong> pasa el mouse sobre cada bloque para ver el detalle de la sección.
            </p>
        </div>
    );
}
