import React, { useState } from 'react';
import DashboardForm from './DashboardForm';

const DashboardModal = ({ isOpen, onClose, onSuccess }) => {
    const [isVisible, setIsVisible] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            // Add a small delay for smooth animation
            const timer = setTimeout(() => setIsVisible(false), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        onClose();
    };

    const handleSuccess = (dashboard) => {
        if (onSuccess) {
            onSuccess(dashboard);
        }
        onClose();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <DashboardForm
            onClose={handleClose}
            onSuccess={handleSuccess}
        />
    );
};

export default DashboardModal;
