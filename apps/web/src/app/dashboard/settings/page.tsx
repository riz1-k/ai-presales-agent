import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsChat } from "@/components/settings/settings-chat";
import { SettingsNotifications } from "@/components/settings/settings-notifications";
import { SettingsProfile } from "@/components/settings/settings-profile";
import { SettingsSecurity } from "@/components/settings/settings-security";

export default function SettingsPage() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<div className="flex flex-col gap-6">
				{/* Header Section */}
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your account and application preferences
					</p>
				</div>

				{/* Settings Sections */}
				<SettingsProfile />
				<SettingsAppearance />
				<SettingsNotifications />
				<SettingsChat />
				<SettingsSecurity />
			</div>
		</div>
	);
}
