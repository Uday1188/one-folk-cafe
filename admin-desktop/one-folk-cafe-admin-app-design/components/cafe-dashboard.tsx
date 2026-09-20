'use client'

import { useState } from 'react'
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Orders', icon: ShoppingBag, count: '12' },
  { label: 'Products', icon: Package },
  { label: 'Categories', icon: FolderOpen },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

const orders = [
  { id: '#1048', time: '10:42 AM', items: '2 items', total: '₹540', payment: 'Paid', status: 'Completed' },
  { id: '#1047', time: '10:31 AM', items: '4 items', total: '₹1,280', payment: 'Paid', status: 'Pending' },
  { id: '#1046', time: '10:18 AM', items: '1 item', total: '₹280', payment: 'Unpaid', status: 'Pending' },
  { id: '#1045', time: '09:56 AM', items: '3 items', total: '₹760', payment: 'Paid', status: 'Completed' },
  { id: '#1044', time: '09:42 AM', items: '2 items', total: '₹460', payment: 'Unpaid', status: 'Cancelled' },
]

function StatusPill({ children, tone }: { children: React.ReactNode; tone: 'green' | 'amber' | 'red' | 'orange' }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>
}

export function CafeDashboard() {
  const [active, setActive] = useState('Dashboard')
  const [range, setRange] = useState('Today')
  const [search, setSearch] = useState('')

  return (
    <div className="cafe-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Coffee size={20} strokeWidth={2.4} /></div>
          <div><div className="brand-name">ONEFOLK</div><div className="brand-subtitle">CAFE / ADMIN</div></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.label
            return <button key={item.label} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setActive(item.label)}><Icon size={18} /><span>{item.label}</span>{item.count && <span className="nav-count">{item.count}</span>}{isActive && <ChevronRight className="nav-arrow" size={15} />}</button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-card"><div className="sync-icon"><CircleDollarSign size={16} /></div><div><strong>Local database</strong><span><i /> All changes synced</span></div><MoreHorizontal size={16} className="muted-icon" /></div>
          <div className="profile"><div className="avatar">AR</div><div className="profile-copy"><strong>Arjun Rao</strong><span>Manager</span></div><ChevronDown size={15} className="muted-icon" /></div>
          <button className="logout"><LogOut size={16} /> Lock &amp; logout</button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><label className="global-search"><Search size={16} /><input placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></label><div className="online-status"><i /> Offline ready</div><button className="icon-button" aria-label="Notifications"><Bell size={18} /><b>3</b></button><div className="top-avatar">AR</div><div className="window-controls"><span>—</span><span>□</span><span>×</span></div></div></header>
        <div className="content">
          <div className="page-heading"><div><p className="eyebrow">SUNDAY, 24 NOVEMBER 2024 <span>•</span> 10:48 AM</p><h1>Good morning, Arjun <span>✦</span></h1><p className="heading-copy">Here&apos;s what&apos;s happening at OneFolk today.</p></div><button className="primary-action"><ShoppingBag size={17} /> Create new order</button></div>
          <div className="range-row"><div className="range-tabs">{['Today', 'This week', 'This month'].map((item) => <button key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}</button>)}</div><button className="date-button">24 Nov, 2024 <ChevronDown size={15} /></button></div>
          <section className="metric-grid">
            <div className="metric-card accent-card"><div className="metric-top"><span>Today&apos;s revenue</span><span className="metric-icon"><CircleDollarSign size={17} /></span></div><div className="metric-value">₹18,640</div><div className="metric-foot positive"><TrendingUp size={14} /> 12.5% <span>vs yesterday</span></div><div className="sparkline"><span style={{height:'30%'}}/><span style={{height:'48%'}}/><span style={{height:'42%'}}/><span style={{height:'67%'}}/><span style={{height:'55%'}}/><span style={{height:'80%'}}/><span style={{height:'70%'}}/><span style={{height:'100%'}}/></div></div>
            <div className="metric-card"><div className="metric-top"><span>Total orders</span><span className="metric-icon neutral"><ShoppingBag size={17} /></span></div><div className="metric-value">86</div><div className="metric-foot positive"><TrendingUp size={14} /> 8.2% <span>vs yesterday</span></div><div className="mini-bars"><span/><span/><span/><span/><span/><span/><span/></div></div>
            <div className="metric-card"><div className="metric-top"><span>Paid amount</span><span className="metric-icon green"><CreditCard size={17} /></span></div><div className="metric-value">₹15,980</div><div className="metric-foot positive"><TrendingUp size={14} /> 14.8% <span>vs yesterday</span></div><div className="progress-track"><div style={{width:'86%'}} /></div><small>86% of total revenue</small></div>
            <div className="metric-card"><div className="metric-top"><span>Unpaid amount</span><span className="metric-icon orange"><CreditCard size={17} /></span></div><div className="metric-value">₹2,660</div><div className="metric-foot warning">4 orders <span>need attention</span></div><div className="unpaid-lines"><i/><i/><i/></div></div>
          </section>
          <section className="chart-grid"><div className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p>Track your sales performance over time</p></div><button className="small-select">Daily <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-line"/>Revenue</span><strong>₹18,640</strong><span className="legend-change">+12.5%</span></div><div className="chart"><div className="chart-y"><span>₹20k</span><span>₹15k</span><span>₹10k</span><span>₹5k</span><span>₹0</span></div><div className="chart-area"><div className="gridline"/><div className="gridline"/><div className="gridline"/><div className="gridline"/><svg viewBox="0 0 760 180" preserveAspectRatio="none" aria-label="Revenue line chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c68642" stopOpacity=".32"/><stop offset="100%" stopColor="#c68642" stopOpacity="0"/></linearGradient></defs><path d="M0 146 C50 139, 72 105, 120 116 S186 130, 232 84 S284 95, 337 102 S392 60, 445 72 S510 93, 554 52 S624 69, 680 39 S726 42, 760 17 L760 180 L0 180Z" fill="url(#fill)"/><path d="M0 146 C50 139, 72 105, 120 116 S186 130, 232 84 S284 95, 337 102 S392 60, 445 72 S510 93, 554 52 S624 69, 680 39 S726 42, 760 17" fill="none" stroke="#d4a373" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="chart-x"><span>18 Nov</span><span>19 Nov</span><span>20 Nov</span><span>21 Nov</span><span>22 Nov</span><span>23 Nov</span><span>24 Nov</span></div></div></div></div>
          <div className="panel orders-panel"><div className="panel-heading"><div><h2>Order status</h2><p>Today&apos;s order breakdown</p></div><MoreHorizontal size={18} className="muted-icon" /></div><div className="donut-wrap"><div className="donut"><div><strong>86</strong><span>Orders</span></div></div><div className="donut-legend"><span><i className="dot amber"/>Pending <b>24</b></span><span><i className="dot green"/>Completed <b>57</b></span><span><i className="dot red"/>Cancelled <b>5</b></span></div></div><div className="order-note"><Utensils size={15}/> Most orders arrive between <strong>9 AM – 11 AM</strong></div></div></section>
          <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>The latest orders placed today</p></div><button className="view-all" onClick={() => setActive('Orders')}>View all orders <ChevronRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>TIME</th><th>ITEMS</th><th>TOTAL</th><th>PAYMENT</th><th>STATUS</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.time}</td><td>{order.items}</td><td><strong>{order.total}</strong></td><td><StatusPill tone={order.payment === 'Paid' ? 'green' : 'orange'}>{order.payment}</StatusPill></td><td><StatusPill tone={order.status === 'Completed' ? 'green' : order.status === 'Pending' ? 'amber' : 'red'}>{order.status}</StatusPill></td><td><button className="row-more" aria-label={`More actions for ${order.id}`}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div></section>
          <footer className="footer"><span>ONEFOLK CAFE ADMIN <b>•</b> v1.0.4</span><span><i/> All systems operational</span></footer>
        </div>
      </main>
    </div>
  )
}

export default CafeDashboard
