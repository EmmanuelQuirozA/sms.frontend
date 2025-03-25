// src/components/FormModal.js
import React from 'react';
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBSwitch ,
	MDBSpinner
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

const FormModal = ({ 
  open, 
  onClose, 
  formGroups, 
  data, 
  setData, 
  onSave, 
  onChangeStatus, 
  title, // Modal title
  size, // Modal size. E.g.: "xl"
  idPrefix, // Field ID prefix. E.g.: "update_" or "create_"
  changeStatus,
  handleStatusSwitchChange,
  isSaving
}) => {
  const { t } = useTranslation();

  // Helper to render a nested container (for nested groups)
  const renderNestedContainer = (container, colSize, index) => {
    // container.columns indicates how many columns to split nested groups into.
    const nestedColSize = Math.floor(12 / (container.columns || 1));
    return (
      <MDBCol key={index} size={colSize}>
        <MDBRow>
          {container.fields.map((nestedGroup, nestedIndex) => {
            // Each nestedGroup should have a groupTitle and its own fields and columns.
            const nestedGroupColSize = Math.floor(12 / (nestedGroup.columns || 1));
            return (
              <MDBCol key={nestedIndex} size={nestedColSize}>
                <div className="mb-3">
                  {nestedGroup.groupTitle && <h6 className="mb-3">{t(nestedGroup.groupTitle)}</h6>}
                  <MDBRow>
                    {nestedGroup.fields.map((nestedField, fieldIndex) => (
                      <MDBCol key={fieldIndex} size={nestedGroupColSize}>
                				<div className="mb-3">
													<MDBInput
														label={t(nestedField.label)}
														id={`${idPrefix}${nestedField.key}`}
														type={nestedField.type || 'text'}
														value={data?.[nestedField.key] ?? ''}
														onChange={(e) =>
															setData({ ...data, [nestedField.key]: e.target.value })
														}
													/>
                				</div>
                      </MDBCol>
                    ))}
                  </MDBRow>
                </div>
              </MDBCol>
            );
          })}
        </MDBRow>
      </MDBCol>
    );
  };

  // Helper to render an individual field or nested group if applicable
  const renderField = (field, colSize, index) => {
    // If the field has a nested fields array but no own key, it's a nested container.
    if (!field.key && field.fields) {
      return renderNestedContainer(field, colSize, index);
    } else if (field.fields) {
      // If it has a key and fields, treat it as a nested group (less common).
      const nestedColSize = Math.floor(12 / (field.columns || 1));
      return (
        <MDBCol key={index} size={colSize}>
          <div className="mb-3">
            {}
            <MDBRow>
              {field.fields.map((nestedField, nestedIndex) => (
                <MDBCol key={nestedIndex} size={nestedColSize}>
                  <MDBInput
                    label={t(nestedField.label)}
                    id={`${idPrefix}${nestedField.key}`}
                    type={nestedField.type || 'text'}
                    value={data?.[nestedField.key] ?? ''}
                    onChange={(e) =>
                      setData({ ...data, [nestedField.key]: e.target.value })
                    }
                  />
                </MDBCol>
              ))}
            </MDBRow>
          </div>
        </MDBCol>
      );
    } else if (field.type === 'image') {
      // Render image field
      return (
        <MDBCol key={index} size={colSize} className="d-flex justify-content-center align-items-center">
          <div className="mb-3">
            <img 
              src={data?.[field.key] || 'https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0='} 
              alt={t(field.label)} 
              className="img-fluid rounded" 
              style={{ maxHeight: '150px' }}
            />
          </div>
        </MDBCol>
      );
    } else {
      // Standard input field
      return (
        <MDBCol key={index} size={colSize}>
          <div className="mb-3">
            <MDBInput
              label={t(field.label)}
              id={`${idPrefix}${field.key}`}
              type={field.type || 'text'}
              value={data?.[field.key] ?? ''}
              onChange={(e) =>
                setData({ ...data, [field.key]: e.target.value })
              }
            />
          </div>
        </MDBCol>
      );
    }
  };

  // Render the form groups
  const renderFormGroups = () => {
    return formGroups.map((group, groupIndex) => {
      const colSize = Math.floor(12 / group.columns);
      return (
        <div key={groupIndex}>
          {group.groupTitle && <h5 className="mb-3">{t(group.groupTitle)}</h5>}
          <MDBRow>
            {group.fields.map((field, fieldIndex) =>
              renderField(field, colSize, fieldIndex)
            )}
          </MDBRow>
          {groupIndex < formGroups.length - 1 && (
            <hr style={{ margin: '10px 0', borderTop: '1px solid rgba(0,0,0,0.5)' }} />
          )}
        </div>
      );
    });
  };

  return (
    <MDBModal open={open} onClose={onClose} tabIndex="-1">
      <MDBModalDialog size={size}>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t(title)}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            {renderFormGroups()}
          </MDBModalBody>
          <MDBModalFooter>
            {changeStatus && (
              <MDBSwitch  
                id="statusSwitch"
                label={t('change_status')}
								checked={(data?.enabled || data?.user_enabled) ?? false}
                onChange={handleStatusSwitchChange}
                disabled={isSaving}
              />
            )}
            <MDBBtn color="secondary" onClick={onClose} disabled={isSaving}>
              {isSaving ? <MDBSpinner size="sm" /> : t('close')}
            </MDBBtn>
            <MDBBtn color="primary" onClick={onSave} disabled={isSaving}>
              {isSaving ? <MDBSpinner size="sm" /> : t('save_changes')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default FormModal;
