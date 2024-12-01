"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/views/ui/card";
import { Button } from "@/components/views/ui/button";
import { Input } from "@/components/views/ui/input";
import notification from "@/lib/notification";
import { useAuthStore } from "@/stores/auth";
import { User } from "lucide-react";
import { updateUserDetails } from "@/actions";

export default function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const user = useAuthStore((state) => state.user);

    const handleUpdateUserDetails = async () => {
        if (!user) return;

        try {
            setIsUpdating(true);

            const updatedUser = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                phone: user.phone,
            };

            await updateUserDetails(updatedUser);

            notification({
                type: "success",
                message: "User details updated successfully",
            });
        } catch (error) {
            notification({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to update user details",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                        ) : (
                            <User size={40} />
                        )}
                        Profile Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label>Email</label>
                            <Input value={user.email} readOnly className="flex-grow" />
                        </div>
                        <div className="space-y-2">
                            <label>First Name</label>
                            <Input
                                value={user.firstName}
                                onChange={(e) =>
                                    useAuthStore.setState({ user: { ...user, firstName: e.target.value } })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Last Name</label>
                            <Input
                                value={user.lastName}
                                onChange={(e) =>
                                    useAuthStore.setState({ user: { ...user, lastName: e.target.value } })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Username</label>
                            <Input
                                value={user.username}
                                onChange={(e) =>
                                    useAuthStore.setState({ user: { ...user, username: e.target.value } })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Phone</label>
                            <Input
                                value={user.phone || ""}
                                onChange={(e) =>
                                    useAuthStore.setState({ user: { ...user, phone: e.target.value } })
                                }
                            />
                        </div>
                        <Button
                            onClick={handleUpdateUserDetails}
                            disabled={isUpdating}
                            className="w-full"
                        >
                            {isUpdating ? "Updating..." : "Update Details"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

