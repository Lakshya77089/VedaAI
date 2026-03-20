import AppShell from '@/components/layout/AppShell'
import CreateAssignmentForm from '@/components/create/CreateAssignmentForm'

export default function CreateAssignmentPage() {
  return (
    <AppShell>
      <div style={{ padding: '28px 32px 100px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)' }}>Create Assignment</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', paddingLeft: 20 }}>
            Set up a new assignment for your students
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <div
            style={{ width: '40%', height: '100%', backgroundColor: '#111827', borderRadius: 4 }}
          />
        </div>

        <CreateAssignmentForm />
      </div>
    </AppShell>
  )
}
