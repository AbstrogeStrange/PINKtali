import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Playlist {
  id: string;
  name: string;
  isSystem: boolean;
  visibility: string;
}

interface SaveModalProps {
  videoId: string;
  onClose: () => void;
}

// Mock playlists for UI
const mockPlaylists: Playlist[] = [
  { id: '1', name: 'Watch Later', isSystem: true, visibility: 'PRIVATE' },
  { id: '2', name: 'Web Dev Tutorials', isSystem: false, visibility: 'PUBLIC' },
  { id: '3', name: 'Music', isSystem: false, visibility: 'UNLISTED' },
];

export const SaveModal: React.FC<SaveModalProps> = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [checkedIds, setCheckedIds] = useState<string[]>(['1']);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
    // In a real app, fire API mutation here
    console.log(`Toggled playlist ${id} for video ${videoId}`);
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = { id: Date.now().toString(), name: newPlaylistName, isSystem: false, visibility: 'PRIVATE' };
    setPlaylists([...playlists, newPlaylist]);
    setCheckedIds([...checkedIds, newPlaylist.id]);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-card border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Save video to...</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-2 max-h-60 overflow-y-auto">
          {playlists.map(p => (
            <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer">
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${checkedIds.includes(p.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                 {checkedIds.includes(p.id) && <Check size={14} />}
              </div>
              <span className="text-sm font-medium">{p.name}</span>
            </label>
          ))}
        </div>

        <div className="p-4 border-t bg-muted/30">
          {!isCreating ? (
            <Button variant="ghost" className="w-full justify-start text-primary" onClick={() => setIsCreating(true)}>
              <Plus size={20} className="mr-2" /> Create new playlist
            </Button>
          ) : (
            <div className="space-y-3">
              <Input 
                placeholder="Enter playlist name..." 
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                 <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                 <Button size="sm" onClick={handleCreate}>Create</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
