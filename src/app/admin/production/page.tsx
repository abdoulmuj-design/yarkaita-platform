'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AdminProductionPage() {
  const { language } = useLanguage()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    },
  }

  const t = translations[language]

  useEffect(() => {
    async function fetchJobs() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const res = await fetch('/api/production/jobs', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch production jobs')
        const data = await res.json()
        setJobs(data)
      } catch (err) {
        setError(t.error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [language])

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
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.jobNumber}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.order}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.priority}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.jobNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.order?.orderNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      job.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}