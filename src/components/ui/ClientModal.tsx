'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

export interface ClientFormData {
  id?: string;
  name: string;
  sector?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientFormData) => Promise<void>;
  initialData?: ClientFormData | null;
}

export function ClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    sector: '',
    contactName: '',
    email: '',
    phone: '',
    address: 'Dakar, Sénégal',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        sector: initialData.sector || '',
        contactName: initialData.contactName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || 'Dakar, Sénégal',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        sector: '',
        contactName: '',
        email: '',
        phone: '',
        address: 'Dakar, Sénégal',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      compact
      kicker="CLIENT"
      title={initialData?.id ? 'Modifier le client' : 'Nouveau client'}
    >
      <form onSubmit={handleSubmit} className="form-grid two-cols">
        <div className="field">
          <label htmlFor="client-name">Entreprise</label>
          <input
            id="client-name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ex: FIDÈLE SARL"
          />
        </div>
        <div className="field">
          <label htmlFor="client-sector">Secteur</label>
          <input
            id="client-sector"
            value={formData.sector}
            onChange={(e) =>
              setFormData({ ...formData, sector: e.target.value })
            }
            placeholder="Ex: BTP & Ingénierie"
          />
        </div>
        <div className="field">
          <label htmlFor="client-contact">Contact principal</label>
          <input
            id="client-contact"
            value={formData.contactName}
            onChange={(e) =>
              setFormData({ ...formData, contactName: e.target.value })
            }
            placeholder="Ex: M. Ndiaye"
          />
        </div>
        <div className="field">
          <label htmlFor="client-email">E-mail</label>
          <input
            id="client-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="contact@client.com"
          />
        </div>
        <div className="field">
          <label htmlFor="client-phone">Téléphone</label>
          <input
            id="client-phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+221 ..."
          />
        </div>
        <div className="field">
          <label htmlFor="client-address">Adresse</label>
          <input
            id="client-address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Dakar, Sénégal"
          />
        </div>
        <div className="field full">
          <label htmlFor="client-notes">Notes</label>
          <textarea
            id="client-notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Remarques particulières, préférences..."
          />
        </div>
        <div className="field full">
          <button
            type="submit"
            className="btn btn-dark"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting
              ? 'Enregistrement...'
              : initialData?.id
              ? 'Enregistrer'
              : 'Ajouter le client'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
