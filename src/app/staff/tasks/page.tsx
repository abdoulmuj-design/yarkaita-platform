'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function TasksPage() {
  const { language } = useLanguage()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const translations = {
    en: {
      title: 'My Tasks',
      noTasks: 'No tasks assigned yet.',
      loading: 'Loading tasks...',
      error: 'Failed to load tasks',
      department: 'Department',
      taskType: 'Task Type',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
    },
    ha: {
      title: 'Aikace-aikace na',
      noTasks: 'Babu aikace-aikacen da aka sanya maka tukuna.',
      loading: 'Ana loda ayyuka...',
      error: 'An kasa loda ayyuka',
      department: 'Sashe',
      taskType: "Nau'in aiki",
      status: 'Matsayi',
      priority: 'Muhimmanci',
      dueDate: 'Kwanan wata',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchTasks() {
      try {
        const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
        const res = await fetch('/api/staff/tasks', {
          headers: {
            'x-user-id': user.id || '',
          },
        })
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [language])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{t.title}</h2>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-600">{t.noTasks}</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{task.taskType}</h3>
                  <p className="text-sm text-gray-500">{task.department}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{task.status}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <p><strong>{t.priority}:</strong> {task.priority}</p>
                {task.dueDate && <p><strong>{t.dueDate}:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}