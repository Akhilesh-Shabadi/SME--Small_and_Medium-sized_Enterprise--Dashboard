import React, { useState } from 'react';
import EditDashboardForm from './EditDashboardForm';

const EditDashboardModal = ({ isOpen, onClose, onSuccess, dashboard }) => {
    const [isVisible, setIsVisible] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
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
        <EditDashboardForm
            dashboard={dashboard}
            onClose={handleClose}
            onSuccess={handleSuccess}
        />
    );
};

export default EditDashboardModal;
