import { useState } from 'react';

export interface ContactFrontend {
  userId: string; 
  owner: string;
  addedAt: Date;
  lists: string[];
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  photoBase64?: string;
}

export interface ContactListItemProps {
  contact: ContactFrontend;
  lists: { id: string; name: string }[];
  onUpdate: (contactId: string, listIds: string[]) => void;
  onDelete: (contactId: string, listId?: string) => void;
  currentListId?: string;
}

export const ContactListItem = ({
  contact,
  lists,
  onUpdate,
  onDelete,
  currentListId
}: ContactListItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleList = (listId: string) => {
    const newListIds = contact.lists.includes(listId)
      ? contact.lists.filter(id => id !== listId)
      : [...contact.lists, listId];
    onUpdate(contact.id, newListIds);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(contact.id, currentListId);
    setMenuOpen(false);
  };

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={contact.photoBase64 || '/avatar-placeholder.png'} alt={contact.name} />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="card-title text-lg">{contact.name}</h3>
            {contact.email && <p className="text-sm">{contact.email}</p>}
            {contact.phoneNumber && <p className="text-sm">{contact.phoneNumber}</p>}
            
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.lists.map(listId => {
                const list = lists.find(l => l.id === listId);
                return list ? (
                  <span key={listId} className="badge badge-outline badge-sm">
                    {list.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ⋮
            </button>
            {menuOpen && (
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-1"
              >
                <li className="menu-title">
                  <span>Add/Remove from Lists</span>
                </li>
                {lists.map((list) => (
                  <li key={list.id}>
                    <a
                      className={contact.lists.includes(list.id) ? 'active' : ''}
                      onClick={() => toggleList(list.id)}
                    >
                      {contact.lists.includes(list.id) && '✔ '}
                      {list.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a className="text-error" onClick={handleDelete}>
                    Remove Contact
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};