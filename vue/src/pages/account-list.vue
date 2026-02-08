<template>
	<v-row class="mb-4">
		<v-col
			cols="12"
			sm="6"
		>
			<v-btn
				color="error"
				:disabled="!selectedItems.length"
				@click="deleteSelected"
				prepend-icon="mdi-delete"
			>
				Delete Selected ({{ selectedItems.length }})
			</v-btn>
		</v-col>
		<v-col
			cols="12"
			sm="6"
			class="text-right"
		>
			<v-btn-toggle
				v-model="viewMode"
				mandatory
				color="grey-darken-3"
				density="compact"
				class="mr-2"
			>
				<v-btn
					value="list"
					prepend-icon="mdi-format-list-bulleted"
					>List</v-btn
				>
				<v-btn
					value="grid"
					prepend-icon="mdi-view-grid"
					>Grid</v-btn
				>
			</v-btn-toggle>
		</v-col>
	</v-row>

	<!-- List View -->
	<v-data-table
		v-model="selectedItems"
		v-if="viewMode === 'list'"
		:headers="listHeaders"
		:items="items"
		:items-per-page="10"
		class="elevation-1 rounded-lg"
		:search="search"
		item-value="id"
		hide-default-footer
		show-select
	>
		<template #item.name="{ item }">
			<div class="d-flex align-center">
				<v-icon
					:color="item.status === 'active' ? 'success' : 'grey'"
					size="small"
					class="mr-2"
				>
					{{ item.status === 'active' ? 'mdi-circle' : 'mdi-circle-outline' }}
				</v-icon>
				<!-- Avatar with error fallback -->
				<v-avatar
					size="32"
					class="mr-3"
				>
					<v-img
						:src="getAvatarUrl(item)"
						alt="Avatar"
						@error="handleImageError(item)"
					>
						<template #error> <v-icon icon="mdi-account-circle-outline" /> </template>
					</v-img>
				</v-avatar>
				<router-link
					:to="`/item/${item.id}`"
					class="name-link"
				>
					{{ item.name }}
				</router-link>
			</div>
		</template>
		<template #item.actions="{ item }">
			<div class="d-flex justify-end">
				<v-btn
					icon="mdi-dots-vertical"
					variant="text"
					size="small"
					:to="`/item/${item.id}`"
				/>
			</div>
		</template>
	</v-data-table>

	<!-- Grid View -->
	<v-row v-if="viewMode === 'grid'">
		<v-col
			v-for="item in items"
			:key="item.id"
			cols="12"
			sm="6"
			md="4"
			lg="3"
		>
			<v-card
				class="item-card h-100"
				:class="{ 'bg-grey-darken-3': selectedItems.includes(item.id) }"
				rounded="lg"
				@click="toggleSelection(item.id)"
			>
				<v-card-item>
					<!-- Avatar with error fallback -->
					<v-avatar
						size="56"
						class="mb-3 mx-auto d-block"
					>
						<v-img
							:src="getAvatarUrl(item)"
							alt="Avatar"
							@error="handleImageError(item)"
						>
							<template #error>
								<v-icon
									icon="mdi-account-circle-outline"
									size="56"
								/>
							</template>
						</v-img>
					</v-avatar>

					<div class="text-h6 font-weight-bold truncate-text d-flex align-center justify-center mb-2">
						<v-icon
							:color="item.status === 'active' ? 'success' : 'grey'"
							size="small"
							class="mr-2"
						>
							{{ item.status === 'active' ? 'mdi-circle' : 'mdi-circle-outline' }}
						</v-icon>
						<router-link
							:to="`/item/${item.id}`"
							class="name-link"
						>
							{{ item.name }}
						</router-link>
					</div>

					<v-card-text class="d-flex align-center justify-center text-body-2 pa-0 truncate-text-description">
						{{ item.description }}
					</v-card-text>
				</v-card-item>
			</v-card>
		</v-col>
	</v-row>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const viewMode = ref('list');
const search = ref('');
const selectedItems = ref<number[]>([]);
const router = useRouter();

type Item = {
	id: number;
	name: string;
	status: string;
	description: string;
	avatar?: string;
	avatarFailed?: boolean; // Track failed image loads
};

const items = reactive<Item[]>([
	{
		id: 1,
		name: 'John Doe',
		status: 'active',
		description: 'First item description',
		avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: 2,
		name: 'Jane Smith',
		status: 'inactive',
		description: 'Second item description',
		avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: 3,
		name: 'Bob Johnson',
		status: 'active',
		description: 'Third item description',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: 4,
		name: 'Alice Brown',
		status: 'active',
		description: 'Fourth item description',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: 5,
		name: 'Charlie Wilson',
		status: 'inactive',
		description: 'Fifth item description',
		avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
	},
]);

type Header = {
	key: string;
	title: string;
	sortable: boolean;
	align?: 'end' | 'center' | 'start';
};

const listHeaders: Header[] = [
	{ key: 'name', title: 'Name', sortable: true },
	{ key: 'description', title: 'Description', sortable: true },
	{ key: 'actions', title: 'Actions', sortable: false, align: 'end' },
];

// Enhanced avatar URL helper with local fallback tracking
const getAvatarUrl = (item: Item): string => {
	// If image previously failed, use initials avatar
	if (item.avatarFailed) {
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=150&background=6c757d&color=fff`;
	}
	return (
		item.avatar ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=150&background=6c757d&color=fff`
	);
};

// Handle image load errors
const handleImageError = (item: Item) => {
	// Prevent infinite error loops
	if (!item.avatarFailed) {
		item.avatarFailed = true;
	}
};

const selectedItemsMapped = computed<Item[]>(() => {
	return items.filter((el: Item) => selectedItems.value.includes(el.id));
});

const toggleSelection = (itemId: number, value = null) => {
	const index = selectedItems.value.indexOf(itemId);
	if (value === true || (value === null && index === -1)) {
		selectedItems.value.push(itemId);
	} else if (value === false || index !== -1) {
		selectedItems.value.splice(index, 1);
	}
};

const deleteSelected = async () => {
	if (!selectedItems.value.length) return;
	selectedItems.value.forEach((id) => {
		const index = items.findIndex((item) => item.id === id);
		if (index > -1) items.splice(index, 1);
	});
	selectedItems.value = [];
};
</script>

<style scoped>
.item-card {
	transition: all 0.2s ease;
	cursor: pointer;
}

.item-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.item-card.selected {
	border: 2px solid var(--v-primary-base) !important;
	background-color: rgba(var(--v-primary-base), 0.04) !important;
}

.truncate-text {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.truncate-text-description {
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.name-link {
	color: inherit !important;
	text-decoration: none;
	transition: all 0.2s ease;
}

.name-link:hover {
	color: rgb(var(--v-theme-primary)) !important;
	text-decoration: underline !important;
}
</style>
