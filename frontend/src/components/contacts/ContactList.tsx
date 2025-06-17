export interface ContactListFrontend {
  id: string;
  owner: string;
  name: string;
  isDefault: boolean; //default lists (family, friends, work)
  createdAt: Date;
}
interface ContactListProps {
  lists: ContactListFrontend[];
  selectedList: string | null;
  onSelect: (listId: string) => void;
  onDelete: (listId: string) => void;
  onSelectAll: () => void; // Add this prop
}

const ContactLists = ({ lists, selectedList, onSelect, onDelete, onSelectAll }:ContactListProps) => {
  return (
    <div>
        <div className="flex items-center justify-center gap-4 mb-5 text-accent-content font-bold text-md">
          <h2 className="cursor-default">My Contact Lists</h2>
          <span>|</span>
          <span
            onClick={onSelectAll}
            className={`cursor-pointer hover:underline ${
              selectedList === null ? 'text-success-content' : ''
            }`}
          >
            All Contacts
          </span>
        </div>
      <ul className="space-y-2">
        {lists.map((list) => (
          <li
            key={list.id?.toString()}
            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
              selectedList === list.id
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 hover:bg-base-300'
            }`}
          >
            <button
              className="flex-1 text-left truncate"
              onClick={() => onSelect(list.id)}
            >
              {list.name}
            </button>

            {!list.isDefault && (
              <button
                className="btn btn-sm btn-square btn-ghost hover:bg-error hover:text-error-content ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(list.id);
                }}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactLists;