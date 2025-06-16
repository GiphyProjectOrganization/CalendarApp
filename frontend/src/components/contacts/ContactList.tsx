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
}

const ContactLists = ({ lists, selectedList, onSelect, onDelete }:ContactListProps) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">My Contact Lists</h2>
      <ul className="menu bg-base-200 rounded-box">
        {lists.map((list) => (
          <li
            key={list.id?.toString()}
            className={`flex justify-between items-center ${
              selectedList === list.id ? 'bg-primary text-primary-content' : ''
            }`}
          >
            <button
              className="flex-1 text-left"
              onClick={() => onSelect(list.id)}
            >
              {list.name}
            </button>
            {!list.isDefault && (
              <button
                className="btn btn-square btn-sm btn-ghost ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(list.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactLists;