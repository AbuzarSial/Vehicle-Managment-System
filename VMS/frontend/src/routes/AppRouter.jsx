import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import BillsPage from '../features/bills/pages/BillsPage'
import CustomersPage from '../features/customers/pages/CustomersPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import InspectionsPage from '../features/inspections/pages/InspectionsPage'
import MechanicsPage from '../features/mechanics/pages/MechanicsPage'
import ServiceCentersPage from '../features/serviceCenters/pages/ServiceCentersPage'
import ServiceRequestsPage from '../features/serviceRequests/pages/ServiceRequestsPage'
import SparePartsPage from '../features/spareParts/pages/SparePartsPage'
import VehiclesPage from '../features/vehicles/pages/VehiclesPage'
import WorkOrdersPage from '../features/workOrders/pages/WorkOrdersPage'
import ReportsPage from '../features/reports/pages/ReportsPage'

function NotFoundPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <p className="text-sm font-medium text-slate-900">Page not found</p>
      <p className="mt-1 text-sm text-slate-500">That route is not part of this app shell.</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        Go to dashboard
      </Link>
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/service-centers" element={<ServiceCentersPage />} />
        <Route path="/mechanics" element={<MechanicsPage />} />
        <Route path="/service-requests" element={<ServiceRequestsPage />} />
        <Route path="/inspections" element={<InspectionsPage />} />
        <Route path="/work-orders" element={<WorkOrdersPage />} />
        <Route path="/spare-parts" element={<SparePartsPage />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
