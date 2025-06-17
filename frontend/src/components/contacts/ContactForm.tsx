import React, { useState, useEffect } from 'react';
import { ContactListFrontend } from './ContactList';
import { FaSearch } from 'react-icons/fa';

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
          <div className="modal-box max-h-[80vh] overflow-auto relative bg-base-100 border border-base-300 rounded-2xl shadow-lg">
            <h3 className="font-extrabold text-xl mb-6 text-base-content tracking-wide">
              Add New Contact
            </h3>

            <div className="form-control mb-6 relative">
              <label className="label flex items-center gap-2 cursor-text select-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-base-content opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <span className="label-text text-base-content font-semibold">Search Users</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full pl-10 pr-4 rounded-xl shadow focus:ring-2 focus:ring-primary transition"
                placeholder="Search by username, email or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-4 top-11">
                  <span className="loading loading-spinner loading-xs"></span>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-bold mb-3 text-base-content">
                  Search Results:
                </div>
                <div className="max-h-44 overflow-y-auto border border-base-300 rounded-xl shadow-inner bg-base-200">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-3 cursor-pointer rounded-xl transition-transform
                      ${
                        selectedUser?.id === user.id
                          ? 'bg-primary text-primary-content shadow-lg scale-[1.03]'
                          : 'hover:bg-primary/20 hover:text-primary transition-shadow'
                      }`}
                      onClick={() => setSelectedUser(user)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedUser(user);
                      }}
                    >
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold truncate">{user.name}</span>
                        <span className="text-xs truncate">{user.email}</span>
                        {user.phoneNumber && (
                          <span className="text-xs truncate">{user.phoneNumber}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="mb-6 flex items-center justify-between bg-base-200 rounded-full py-2 px-4 shadow-md border border-base-300">
                <div className="flex items-center gap-3">
                  {selectedUser.profilePhoto ? (
                    <img
                      src={selectedUser.profilePhoto}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-base-content font-bold">{selectedUser.name}</div>
                    <div className="text-sm">{selectedUser.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Remove selected user"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="form-control mb-6">
              <label className="label font-semibold text-base-content">
                Add to Lists (optional)
              </label>
              <div className="max-h-36 overflow-y-auto border border-base-300 rounded-xl p-3 bg-base-200 shadow-inner">
                {lists.length === 0 && (
                  <p className="text-base-content opacity-50 italic">No lists available</p>
                )}
                {lists.map((list) => (
                  <label
                    key={list.id}
                    className="flex items-center gap-3 cursor-pointer mb-2 select-none"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedLists.includes(list.id)}
                      onChange={() => {
                        setSelectedLists((prev) =>
                          prev.includes(list.id)
                            ? prev.filter((id) => id !== list.id)
                            : [...prev, list.id]
                        );
                      }}
                    />
                    <span className="text-base-content font-medium">{list.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-action flex justify-end gap-4">
              <button
                className="btn btn-outline btn-md rounded-xl px-6 font-semibold tracking-wide transition hover:bg-base-300"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-md rounded-xl px-6 font-bold tracking-wider"
                onClick={handleSubmit}
                disabled={!selectedUser}
              >
                Add Contact
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={onClose}
          />
        </div>
      )}

    </>
  );
};

export default ContactForm;