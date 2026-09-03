'use client'

import { useState, useEffect } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState<'en' | 'ha'>('en')

  const translations = {
    en: {
      title: 'My Tasks',
      loading: 'Loading tasks...',
      noTasks: 'No tasks assigned yet.',
      department: 'Department',
      taskType: 'Task Type',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
      switchToHausa: 'Hausa',
    },
    ha: {
      title: 'Aikace-aikace na',
      loading: 'Ana ɗaukar ayyuka...',
      noTasks: 'Babu aikace-aikacen da aka sanya maka tukuna.',
      department: 'Sashe',
      taskType: 'Nau\'in aiki',
      status: 'Matsayi',
      priority: 'Muhimmanci',
      dueDate: 'Kwanan wata',
      switchToEnglish: 'English',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('yarkaita_user') || '{}')
        if (!user.id) {
          throw new Error('No user found')
        }

        // Fetch tasks using user ID as a header
        const res = await fetch('/api/staff/tasks', {
          headers: {
            'x-user-id': user.id,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${language === 'en' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ha')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${language === 'ha' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Hausa
          </button>
        </div>
      </div>

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
                  <h3 className="font-semibold text-lg text-gray-800">{task.taskType}</h3>
                  <p className="text-sm text-gray-500">{task.department}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{task.status}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong className="text-gray-800">Priority:</strong> {task.priority}</p>
                {task.dueDate && <p><strong className="text-gray-800">Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}