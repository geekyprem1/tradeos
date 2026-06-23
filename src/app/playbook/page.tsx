'use client';

import * as React from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { PlaybookSetup } from '@/lib/types';
import { SetupCard } from '@/components/playbook/SetupCard';
import { SetupForm } from '@/components/playbook/SetupForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { Plus } from 'lucide-react';

export default function PlaybookPage() {
  const supabase = createBrowserClient();
  const { showToast } = useToast();
  
  const [setups, setSetups] = React.useState<PlaybookSetup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const [editingSetup, setEditingSetup] = React.useState<PlaybookSetup | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [archivingId, setArchivingId] = React.useState<string | null>(null);

  const loadSetups = React.useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('playbook_setups')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      setSetups(data || []);
    }
    setIsLoading(false);
  }, [supabase, showToast]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSetups();
  }, [loadSetups]);

  const handleOpenAdd = () => {
    setEditingSetup(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (setup: PlaybookSetup) => {
    setEditingSetup(setup);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSetup(null);
  };

  const handleSaveSetup = async (formData: Partial<PlaybookSetup>) => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingSetup) {
      // UPDATE
      const { error } = await supabase
        .from('playbook_setups')
        .update({
          name: formData.name,
          entry_conditions: formData.entry_conditions,
          timeframe: formData.timeframe,
          min_rr_ratio: formData.min_rr_ratio,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSetup.id);

      if (error) {
        showToast({ message: error.message, variant: 'error' });
      } else {
        showToast({ message: 'Setup updated', variant: 'success' });
        handleCloseModal();
        loadSetups();
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('playbook_setups')
        .insert({
          user_id: session.user.id,
          name: formData.name,
          entry_conditions: formData.entry_conditions,
          timeframe: formData.timeframe,
          min_rr_ratio: formData.min_rr_ratio,
          notes: formData.notes,
          total_trades: 0,
          winning_trades: 0,
          is_active: true,
        });

      if (error) {
        showToast({ message: error.message, variant: 'error' });
      } else {
        showToast({ message: 'Setup created', variant: 'success' });
        handleCloseModal();
        loadSetups();
      }
    }
    setIsSaving(false);
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this setup? It will no longer be available for new trades.')) return;
    
    setArchivingId(id);
    const { error } = await supabase
      .from('playbook_setups')
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      showToast({ message: 'Setup archived', variant: 'success' });
      loadSetups();
    }
    setArchivingId(null);
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading playbook...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Playbook</h1>
          <p className="text-muted mt-1 text-sm">Manage your edge. Define your setups.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Setup
        </Button>
      </div>

      {setups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted p-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-white">No active setups</h3>
          <p className="mb-6 text-sm text-muted max-w-md">
            Your playbook is empty. You need at least one defined setup before you can create a commitment contract or log trades.
          </p>
          <Button onClick={handleOpenAdd}>Create your first setup</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {setups.map((setup) => (
            <SetupCard
              key={setup.id}
              setup={setup}
              onEdit={handleOpenEdit}
              onArchive={handleArchive}
              isArchiving={archivingId === setup.id}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingSetup ? 'Edit Setup' : 'New Setup'}
      >
        <SetupForm
          defaultValues={editingSetup || undefined}
          onSubmit={handleSaveSetup}
          onCancel={handleCloseModal}
          isLoading={isSaving}
          submitLabel={editingSetup ? 'Save Changes' : 'Create Setup'}
        />
      </Modal>
    </div>
  );
}
