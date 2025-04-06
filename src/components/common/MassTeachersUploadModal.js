// src/components/MassUploadModal.js
import React, { useState, useCallback } from 'react';
import { MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBBtn, MDBSpinner, MDBTable, MDBTableHead, MDBTableBody, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import swal from 'sweetalert';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MassUploadModal = ({ open, onClose, onUploadSuccess, school_id }) => {
	const { t, i18n } = useTranslation();
	const [parsedData, setParsedData] = useState([]);
	const [validationErrors, setValidationErrors] = useState([]);
	const [isUploading, setIsUploading] = useState(false);

	// Validate each row (adjust required fields as needed)
	const validateRow = (row, index) => {
		const errors = [];
		if (!row.first_name || row.first_name.trim() === '') {
			errors.push(`${t('first_name')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.last_name_father || row.last_name_father.trim() === '') {
			errors.push(`${t('last_name_father')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.last_name_mother || row.last_name_mother.trim() === '') {
			errors.push(`${t('last_name_mother')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.birth_date || row.birth_date.trim() === '') {
			errors.push(`${t('birth_date')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.username || row.username.trim() === '') {
			errors.push(`${t('username')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.password || row.password.trim() === '') {
			errors.push(`${t('password')} ${t('is_required')} (Row ${index + 1})`);
		}
		if (!row.email || row.email.trim() === '') {
			errors.push(`${t('email')} ${t('is_required')} (Row ${index + 1})`);
		}
		return errors;
	};

	// Handle file drop and parse CSV using Papa Parse
	const onDrop = useCallback((acceptedFiles) => {
		if (acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
          // Map through the rows and set role_id to 2 by default if not provided.
          const data = results.data.map(row => ({
            ...row,
            role_id: row.role_id ? row.role_id : "2", //Teacher role ID
            school_id: row.school_id ? row.school_id : school_id
          }));
					let errors = [];
					data.forEach((row, index) => {
						const rowErrors = validateRow(row, index);
						if (rowErrors.length > 0) {
							errors = errors.concat(rowErrors);
						}
					});
					setParsedData(data);
					setValidationErrors(errors);
				},
				error: (err) => {
					console.error("Error parsing file:", err);
				}
			});
		}
	}, [t]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.csv' });

	// Handle upload of parsed data to the backend
	const handleUpload = () => {
		if (validationErrors.length > 0) {
			swal(t('error_title'), t('please_fix_errors_before_upload'), 'error');
			return;
		}
		setIsUploading(true);
		const token = localStorage.getItem('token');
		axios.post(`http://localhost:8080/api/users/create?lang=${i18n.language}`, parsedData, {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(response => {
				swal(t('success_title'), t('upload_successful'), 'success');
				setParsedData([]);
				setValidationErrors([]);
				try {
					onUploadSuccess();
				} catch (error) {
					
				}
				onClose();
			})
			.catch(err => {
				swal(t('error_title'), t('upload_failed'), 'error');
				console.error("Error uploading data:", err);
			})
			.finally(() => {
				setIsUploading(false);
			});
	};

	return (
		<MDBModal open={open} onClose={onClose} tabIndex="-1">
			<MDBModalDialog size="xl">
				<MDBModalContent>
					<MDBModalHeader>
						<MDBModalTitle>{t('mass_upload_teachers')}</MDBModalTitle>
						<MDBBtn className="btn-close" color="none" onClick={onClose}></MDBBtn>
					</MDBModalHeader>
					<MDBModalBody>
						<div 
							{...getRootProps()} 
							style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
						>
							<input {...getInputProps()} />
							{isDragActive 
								? <p>{t('drop_the_file_here')}</p> 
								: <p>{t('drag_and_drop_a_csv_file_here_or_click_to_select')}</p>}
						</div>
						{parsedData.length > 0 && (
							<div style={{ marginTop: '20px' }}>
								<h6>{t('preview')}</h6>
								{validationErrors.length > 0 && (
									<div style={{ color: 'red', marginBottom: '10px' }}>
										{validationErrors.map((err, idx) => (
											<div key={idx}>{err}</div>
										))}
									</div>
								)}
								<MDBRow>
									<MDBCol>
										<MDBTable responsive striped>
											<MDBTableHead>
												<tr>
													{Object.keys(parsedData[0]).map((key, index) => (
														<th key={index}>{t(key)}</th>
													))}
												</tr>
											</MDBTableHead>
											<MDBTableBody>
												{parsedData.map((row, idx) => (
													<tr key={idx}>
														{Object.keys(row).map((key, i) => (
															<td key={i}>{row[key]}</td>
														))}
													</tr>
												))}
											</MDBTableBody>
										</MDBTable>
									</MDBCol>
								</MDBRow>
							</div>
						)}
					</MDBModalBody>
					<MDBModalFooter>
						<MDBBtn color="secondary" onClick={onClose} disabled={isUploading}>
							{isUploading ? <MDBSpinner size="sm" /> : t('close')}
						</MDBBtn>
						<MDBBtn color="primary" onClick={handleUpload} disabled={isUploading || parsedData.length === 0}>
							{isUploading ? <MDBSpinner size="sm" /> : t('upload')}
						</MDBBtn>
					</MDBModalFooter>
				</MDBModalContent>
			</MDBModalDialog>
		</MDBModal>
	);
};

export default MassUploadModal;
