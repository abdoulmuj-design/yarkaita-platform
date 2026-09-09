'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

export default function AdminProductionPage() {
  const { language } = useLanguage()
  const [jobs, setJobs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ [taskId: string]: string }>({})

  const translations = {
    en: {
      title: 'Production Jobs',
      loading: 'Loading production jobs...',
      error: 'Failed to load production jobs',
      noJobs: 'No production jobs found.',
      jobNumber: 'Job Number',
      order: 'Order',
      status: 'Status',
      priority: 'Priority',
      date: 'Date',
      tasks: 'Tasks',
      assign: 'Assign Staff',
      assignBtn: 'Assign',
      noUser: 'Select Staff',
      viewDetails: 'View Details',
    },
    ha: {
      title: 'Ayyukan Samarwa',
      loading: 'Ana loda ayyukan samarwa...',
      error: 'An kasa loda ayyukan samarwa',
      noJobs: 'Babu ayyukan samarwa da aka samu.',
      jobNumber: 'Lambar Aiki',
      order: 'Oda',
      status: 'Matsayi',
      priority: 'Muhimmanci',
      date: 'Kwanan wata',
      tasks: 'Ayyuka',
      assign: 'Sanya Ma\'aikaci',
      assignBtn: 'Sanya',
      noUser: 'Zaɓi Ma\'aikaci',
      viewDetails: 'Duba Cikakken Bayani',
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [jobsRes, usersRes] = await Promise.all([
          fetch('/api/production/jobs', { headers }),
          fetch('/api/users', { headers }),
        ])

        const jobsData = await jobsRes.json()
        const usersData = await usersRes.json()
        
        setJobs(Array.isArray(jobsData) ? jobsData : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [language])

  async function handleAssign(taskId: string) {
    const userId = selectedUser[taskId]
    if (!userId) {
      alert('Please select a staff member first.')
      return
    }

    try {
      const token = localStorage.getItem('yarkaita_token')
      const res = await fetch(`/api/production/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignedUserId: userId }),
      })

      if (!res.ok) throw new Error('Failed to assign task')

      alert('Task assigned successfully!')
      // Refetch jobs
      const updated = await fetch('/api/production/jobs', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await updated.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      alert('Failed to assign task')
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{t.title}</h2>

      {loading ? (
        <p className="text-gray-600">{t.loading}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-600">{t.noJobs}</p>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-lg">{job.jobNumber}</h3>
                  <p className="text-sm text-gray-500">{job.order?.orderNumber || '-'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">{t.tasks}</h4>
                {job.tasks?.length === 0 ? (
                  <p className="text-gray-500">No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {job.tasks?.map((task: any) => (
                      <div key={task.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                          <Link href={`/admin/production/tasks/${task.id}`} className="font-medium text-blue-600 hover:underline">
                            {task.taskType}
                          </Link>
                          <p className="text-sm text-gray-500">{task.department}</p>
                          {task.assignedUser && (
                            <p className="text-sm text-green-600">
                              Assigned to: {task.assignedUser.name}
                            </p>
                          )}
                        </div>
                        {!task.assignedUser && (
                          <div className="flex gap-2">
                            <select
                              value={selectedUser[task.id] || ''}
                              onChange={(e) => setSelectedUser({ ...selectedUser, [task.id]: e.target.value })}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="">{t.noUser}</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.roles?.[0]?.role?.name || 'No Role'})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(task.id)}
                              className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                            >
                              {t.assignBtn}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}