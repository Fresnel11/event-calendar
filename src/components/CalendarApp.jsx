import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { useEffect, useState } from 'react'
import '@schedule-x/theme-default/dist/index.css'
import {
    createViewDay,
    createViewMonthAgenda,
    createViewMonthGrid,
    createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

function CalendarApp() {
    const eventsService = useState(() => createEventsServicePlugin())[0]
    
    const [currentMonth, setCurrentMonth] = useState(new Date())  // État pour gérer le mois actuel

    const calendar = useCalendarApp({
        views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
        events: [
            {
                id: '1',
                title: 'Event 1',
                start: '2023-12-16',
                end: '2023-12-16',
            },
        ],
        plugins: [eventsService]
    })

    useEffect(() => {
        eventsService.getAll()
    }, [])

    // Fonction pour afficher le mois et l'année actuels dans l'en-tête
    const monthYear = `${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`;

    // Fonction pour changer de mois
    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="container mx-auto p-4">
            <div className="calendar-header mb-6 flex justify-between items-center">
                <button 
                    className="px-4 py-2 bg-blue-500 cursor-pointer text-white rounded-md shadow-md hover:bg-blue-600"
                    onClick={handlePrevMonth}
                >
                    Précédent
                </button>
                <h2 className="text-xl font-semibold">{monthYear}</h2>
                <button 
                    className="px-4 py-2 bg-blue-500 cursor-pointer text-white rounded-md shadow-md hover:bg-blue-600"
                    onClick={handleNextMonth}
                >
                    Suivant
                </button>
            </div>
            <div className="calendar-view bg-white shadow-lg rounded-lg overflow-hidden">
                <ScheduleXCalendar calendarApp={calendar} />
            </div>
        </div>
    )
}

export default CalendarApp
