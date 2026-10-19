"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Upload,
  message,
  Divider,
} from "antd";
import {
  User,
  Camera,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { UploadProps } from "antd";
import { isAxiosError } from "axios";
import UserServices from "../../services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";

const { TextArea } = Input;

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  joinedDate?: string;
  tier?: string;
}

const UserProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [passwordForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setChangingPassword(true);
    try {
      await UserServices(axiosUser).changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      messageApi.success("Password changed successfully");
    } catch (error) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      messageApi.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const userService = UserServices(axiosUser);

          let userData = await userService.findDetailByToken(session.user.id);

          if (!userData) {
            userData = await userService.findById(session.user.id);
          }

          if (userData) {
            setUserProfile({
              id: userData.id?.toString() || "",
              userId: userData.userId || session.user.id || "",
              username: userData.username || "",
              fullname: userData.fullname || session.user.name || "User",
              email: userData.email || session.user.email || "",
              phone: userData.phoneNumber || "",
              bio: userData.description || "",
              avatar: userData.avatar || session.user.image || "",
              joinedDate: userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                : "Recent",
              tier: userData.tier || "",
            });
          } else {
            setUserProfile({
              id: "",
              userId: session.user.id,
              username: "",
              fullname: session.user.name || "User",
              email: session.user.email || "",
              phone: "",
              bio: "",
              avatar: session.user.image || "",
              joinedDate: "Recent",
              tier: "",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile({
            id: "",
            userId: session.user.id,
            username: "",
            fullname: session.user.name || "User",
            email: session.user.email || "",
            phone: "",
            bio: "",
            avatar: session.user.image || "",
            joinedDate: "Recent",
            tier: "",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleEdit = () => {
    setIsEditing(true);
    if (userProfile) {
      form.setFieldsValue(userProfile);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    
    try {
      const userService = UserServices(axiosUser);

      const updateData = {
        fullname: values.fullname,
        email: values.email,
        phoneNumber: values.phone,
        description: values.bio,
      };

      let updateResult;
      try {
        updateResult = await userService.updateDetailByToken(
          session?.user?.id || "",
          updateData
        );
        console.log("Update result (token):", updateResult);
      } catch (error) {
        console.log("Token update failed, trying by ID:", error);
        updateResult = await userService.update(userProfile?.id || "", updateData);
        console.log("Update result (ID):", updateResult);
      }

      if (updateResult) {
        setUserProfile({ 
          ...userProfile!, 
          phone: values.phone || userProfile!.phone,
          bio: values.bio || userProfile!.bio
        });
        setIsEditing(false);
        messageApi.success("Profile updated successfully!");
      } else {
        messageApi.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      messageApi.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "avatar",
    listType: "picture-card",
    className: "avatar-uploader",
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        messageApi.error("You can only upload JPG/PNG file!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        messageApi.error("Image must smaller than 2MB!");
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === "done") {
        messageApi.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        messageApi.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-96">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">User Profile</h1>
        {!isEditing && (
          <Button
            type="primary"
            icon={<Edit3 className="w-4 h-4" />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-lg"
        style={{ padding: 24, backgroundColor: "#18181B" }}
      >
        <Card className="lg:col-span-1" style={{ backgroundColor: "#18181B" }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {userProfile.avatar ? (
                <Avatar size={120} src={userProfile.avatar} />
              ) : (
                <Avatar size={120} icon={<User className="w-20 h-20" />} />
              )}
              {/* {isEditing && (
                <Upload {...uploadProps}>
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<Camera className="w-4 h-4" />}
                    className="absolute bottom-0 right-0"
                  />
                </Upload>
              )} */}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">
                {userProfile.fullname}
              </h2>
              <p className="text-gray-400">Username: {userProfile.username}</p>
            </div>

            <Divider className="my-4" />

            <div className="w-full space-y-3 text-sm">
              {userProfile.phone && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{userProfile.phone}</span>
                </div>
              )}

              {userProfile.joinedDate && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {userProfile.joinedDate}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card
          className="lg:col-span-2"
          style={{ backgroundColor: "#18181B" }}
          title={
            <div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </div>
              <Divider style={{ margin: "8px 0 0 0", borderColor: "#333" }} />
            </div>
          }
          styles={{
            body: { padding: 24, backgroundColor: "#18181B" },
            header: {
              backgroundColor: "#18181B",
              borderBottom: "1px solid #333",
            },
          }}
        >
          {isEditing ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                phone: userProfile?.phone,
                bio: userProfile?.bio,
                fullname: userProfile?.fullname,
                email: userProfile?.email,
                username: userProfile?.username
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="fullname"
                  label="Full Name"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item name="phone" label="Phone">
                  <Input placeholder="Enter your phone number" />
                </Form.Item>

                <Form.Item name="username" label="Username">
                  <Input disabled />
                </Form.Item>
              </div>

              <Form.Item name="bio" label="Bio">
                <TextArea rows={4} placeholder="Tell us about yourself..." />
              </Form.Item>

              <div className="flex gap-3 justify-end">
                <Button onClick={handleCancel} icon={<X className="w-4 h-4" />}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name
                  </label>
                  <p className="text-white">{userProfile.fullname}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-white">{userProfile.email}</p>
                </div>

                {userProfile.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Phone
                    </label>
                    <p className="text-white">{userProfile.phone}</p>
                  </div>
                )}

                {userProfile.tier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Tier
                    </label>
                    <p className="text-white">{userProfile.tier}</p>
                  </div>
                )}
              </div>

              <Divider />

              {userProfile.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <p className="text-white leading-relaxed">
                    {userProfile.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card
          className="lg:col-span-2 lg:col-start-2"
          style={{ backgroundColor: "#18181B" }}
          title={
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </div>
              <Divider style={{ margin: "8px 0 0 0", borderColor: "#333" }} />
            </div>
          }
          styles={{
            body: { padding: 24, backgroundColor: "#18181B" },
            header: {
              backgroundColor: "#18181B",
              borderBottom: "1px solid #333",
            },
          }}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: "Enter your current password" }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: "Enter a new password" }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Confirm the new password" },
                  ({ getFieldValue }) => ({
                    validator: (_, value) =>
                      !value || getFieldValue("newPassword") === value
                        ? Promise.resolve()
                        : Promise.reject(new Error("Passwords do not match")),
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </div>
            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                icon={<Save className="w-4 h-4" />}
              >
                Change Password
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
