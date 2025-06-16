import { useState, useEffect } from 'react';

interface ListFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const ListForm = ({ open, onClose, onSubmit }: ListFormProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) setName('');
  }, [open]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Contact List</h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">List Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={onClose}></div>
        </div>
      )}
    </>
  );
};

export default ListForm;
