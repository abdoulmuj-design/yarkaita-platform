'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProductionTaskDetailPage() {
  const params = useParams()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTask() {
      try {
        const token = localStorage.getItem('yarkaita_token')
        const res = await fetch(`/api/production/tasks/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch task')
        const data = await res.json()
        setTask(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [params.id])

  if (loading) return <p className="text-gray-600">Loading...</p>
  if (!task) return <p className="text-red-600">Task not found</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Task Details</h1>
        
        <div className="space-y-3">
          <p><strong>Task Type:</strong> {task.taskType}</p>
          <p><strong>Department:</strong> {task.department}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          {task.assignedUser && (
            <p><strong>Assigned To:</strong> {task.assignedUser.name} ({task.assignedUser.email})</p>
          )}
          
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Order Information</h3>
            {task.productionJob?.order ? (
              <>
                <p><strong>Order Number:</strong> {task.productionJob.order.orderNumber}</p>
                <p><strong>Customer:</strong> {task.productionJob.order.customer?.firstName} {task.productionJob.order.customer?.lastName}</p>
                <p><strong>Sales Channel:</strong> {task.productionJob.order.salesChannel || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ₦{task.productionJob.order.totalAmount?.toString() || 'N/A'}</p>
              </>
            ) : (
              <p className="text-gray-500">No order linked to this production job.</p>
            )}
          </div>

          {task.notes && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{task.notes}</p>
            </div>
          )}
        </div>

        <Link href="/admin/production" className="text-blue-600 hover:underline mt-4 block">
          Back to Production
        </Link>
      </div>
    </div>
  )
}