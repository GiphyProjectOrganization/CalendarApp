import React, { useState, useEffect } from 'react';
import { ContactListFrontend } from './ContactList';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
}

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string, listIds?: string[]) => void;
  lists: ContactListFrontend[];
}

const ContactForm = ({ open, onClose, onSubmit, lists }: ContactFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setSelectedLists([]);
    }
  }, [open]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/lookup?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = () => {
    if (!selectedUser) return;
    onSubmit(selectedUser.id, selectedLists.length > 0 ? selectedLists : undefined);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Contact</h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Search Users</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Search by username, email or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-8 top-12">
                  <span className="loading loading-spinner loading-xs"></span>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Search Results:</div>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 hover:bg-base-200 cursor-pointer ${selectedUser?.id === user.id ? 'bg-base-200' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-2">
                        {user.profilePhoto && (
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img src={user.profilePhoto} alt={user.name} />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm opacity-70">{user.email}</div>
                          {user.phoneNumber && (
                            <div className="text-sm opacity-70">{user.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="mb-4 p-3 bg-base-100 rounded-lg border border-base-300">
                <div className="font-medium">Selected User:</div>
                <div className="flex items-center gap-2 mt-1">
                  {selectedUser.profilePhoto && (
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img src={selectedUser.profilePhoto} alt={selectedUser.name} />
                      </div>
                    </div>
                  )}
                  <div>
                    <div>{selectedUser.name}</div>
                    <div className="text-sm opacity-70">{selectedUser.email}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Add to Lists (optional)</span>
              </label>
              <select
                multiple
                className="select select-bordered w-full h-32"
                value={selectedLists}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                  setSelectedLists(selected);
                }}
              >
                {lists.map((list) => (
                  <option key={list.id?.toString()} value={list.id?.toString()}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onClose}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!selectedUser}
              >
                Add Contact
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={onClose}></div>
        </div>
      )}
    </>
  );
};

export default ContactForm;