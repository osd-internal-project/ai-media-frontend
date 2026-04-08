import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Modal, Select, Upload, Image, type UploadFile } from "antd";
import { InboxOutlined } from "@ant-design/icons";

type LogoType = "primary" | "secondary" | "icon" | "light" | "dark";

export interface LogoModalValues {
	name: string;
	url: string;
	logoType: LogoType;
}

interface LogoModalProps {
	open: boolean;
	mode: "create" | "edit";
	confirmLoading?: boolean;
	initialValues?: Partial<LogoModalValues>;
	onCancel: () => void;
	onSubmit: (values: LogoModalValues) => Promise<void> | void;
}

const toDataUrl = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
};

const LogoModal: React.FC<LogoModalProps> = ({
	open,
	mode,
	confirmLoading,
	initialValues,
	onCancel,
	onSubmit,
}) => {
	const [form] = Form.useForm<LogoModalValues>();
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	useEffect(() => {
		if (!open) return;

		const nextValues: LogoModalValues = {
			name: initialValues?.name || "",
			url: initialValues?.url || "",
			logoType: (initialValues?.logoType as LogoType) || "primary",
		};

		form.setFieldsValue(nextValues);
		setPreviewUrl(nextValues.url);
		setFileList([]);
	}, [open, initialValues, form]);

	const uploadHint = useMemo(
		() =>
			mode === "edit"
				? "Drop a new image to replace the current logo"
				: "Drop logo image here or click to browse",
		[mode],
	);

	const handleOk = async () => {
		const values = await form.validateFields();
		await onSubmit(values);
	};

	return (
		<Modal
			zIndex={1500}
			title={mode === "edit" ? "Edit Logo" : "Add Logo"}
			open={open}
			confirmLoading={confirmLoading}
			onOk={handleOk}
			onCancel={onCancel}
			okText={mode === "edit" ? "Save" : "Add Logo"}
			cancelText="Cancel"
		>
			<Form form={form} layout="vertical" initialValues={{ logoType: "primary" }}>
				<Form.Item
					name="name"
					label="Logo Name"
					rules={[{ required: true, message: "Please enter logo name" }]}
				>
					<Input placeholder="e.g. Main Brand Logo" />
				</Form.Item>

				<Form.Item
					name="url"
					label="Logo Image"
					rules={[{ required: true, message: "Please upload logo image" }]}
				>
					<Input type="hidden" />
				</Form.Item>

				<Upload.Dragger
					accept="image/*"
					multiple={false}
					maxCount={1}
					fileList={fileList}
					beforeUpload={async (file) => {
						const dataUrl = await toDataUrl(file as File);
						form.setFieldValue("url", dataUrl);
						setPreviewUrl(dataUrl);
						setFileList([
							{
								uid: file.uid,
								name: file.name,
								status: "done",
								url: dataUrl,
							},
						]);
						return false;
					}}
					onRemove={() => {
						form.setFieldValue("url", "");
						setPreviewUrl("");
						setFileList([]);
					}}
					onChange={({ fileList: nextFileList }) => {
						setFileList(nextFileList.slice(-1));
					}}
					style={{ marginBottom: 12 }}
				>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">Upload Logo Image</p>
					<p className="ant-upload-hint">{uploadHint}</p>
				</Upload.Dragger>

				{previewUrl ? (
					<div style={{ marginBottom: 12 }}>
						<Image
							src={previewUrl}
							alt="Logo preview"
							style={{
								width: "100%",
								maxHeight: 180,
								objectFit: "contain",
								borderRadius: 8,
								border: "1px solid rgba(0,0,0,0.08)",
								background: "rgba(0,0,0,0.03)",
							}}
							preview
						/>
					</div>
				) : null}

				<Form.Item
					name="logoType"
					label="Logo Type"
					rules={[{ required: true, message: "Please select logo type" }]}
				>
					<Select
						options={[
							{ value: "primary", label: "Primary" },
							{ value: "secondary", label: "Secondary" },
							{ value: "icon", label: "Icon" },
							{ value: "light", label: "Light" },
							{ value: "dark", label: "Dark" },
						]}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default LogoModal;
