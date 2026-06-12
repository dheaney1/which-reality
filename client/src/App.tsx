import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProfileSelector from './components/ProfileSelector'
import Home from './pages/Home'
import AddCollege from './pages/AddCollege'
import CollegeDetail from './pages/CollegeDetail'
import type { FamilyMember } from './types'

const STORAGE_KEY = 'campuslog_member'

export default function App() {
  const [activeMember, setActiveMember] = useState<FamilyMember | null>(null)
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setActiveMember(JSON.parse(saved) as FamilyMember)
    } else {
      setShowSelector(true)
    }
  }, [])

  function selectMember(member: FamilyMember) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(member))
    setActiveMember(member)
    setShowSelector(false)
  }

  if (showSelector || !activeMember) {
    return <ProfileSelector onSelect={selectMember} />
  }

  return (
    <Layout activeMember={activeMember} onChangeProfile={() => setShowSelector(true)}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddCollege />} />
        <Route path="/college/:id" element={<CollegeDetail activeMember={activeMember} />} />
      </Routes>
    </Layout>
  )
}
