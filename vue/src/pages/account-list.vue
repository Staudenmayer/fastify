<template>
	<v-row class="mb-4">
		<v-col
			cols="12"
			sm="6"
			class="d-flex ga-5"
		>
			<v-btn
				color="primary"
				@click="addNewAccount"
				prepend-icon="mdi-plus"
			>
				Add
			</v-btn>
			<v-btn
				color="error"
				:disabled="!selectedItems.length"
				@click="deleteSelected"
				prepend-icon="mdi-delete"
			>
				Delete ({{ selectedItems.length }})
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
		class="elevation-1 rounded-lg d-flex"
		:search="search"
		item-value="id"
		show-select
	>
		<template #item.name="{ item }">
			<div class="d-flex align-center">
				<v-icon
					:color="item.status === 'online' ? 'success' : 'grey'"
					size="small"
					class="mr-2"
				>
					{{ item.status === 'online' ? 'mdi-circle' : 'mdi-circle-outline' }}
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

					<div class="text-h6 font-weight-bold truncate-text d-flex align-center justify-center">
						<v-icon
							:color="item.status === 'online' ? 'success' : 'grey'"
							size="small"
							class="mr-2"
						>
							{{ item.status === 'online' ? 'mdi-circle' : 'mdi-circle-outline' }}
						</v-icon>
						<router-link
							:to="`/item/${item.id}`"
							class="name-link"
						>
							{{ item.name }}
						</router-link>
					</div>
					<v-card-text class="d-flex align-center justify-center text-body-2 pa-0 truncate-text-description mb-2">
						{{ item.email }}
					</v-card-text>
					<v-card-text class="d-flex align-center justify-center text-body-2 pa-0 truncate-text-description">
						{{ item.description }}
					</v-card-text>
				</v-card-item>
			</v-card>
		</v-col>
	</v-row>
</template>

<script setup lang="ts">
import { useAccountListData, type Account } from '@/stores/account-list';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const viewMode = ref('list');
const search = ref('');
const selectedItems = ref<string[]>([]);
const router = useRouter();

interface Item extends Account {
	avatarFailed?: boolean; // Track failed image loads
}

const { $state, deleteAccount, addAccount } = useAccountListData();

const items = reactive<Item[]>($state);

type Header = {
	key: string;
	title: string;
	sortable: boolean;
	align?: 'end' | 'center' | 'start';
};

const listHeaders: Header[] = [
	{ key: 'name', title: 'Name', sortable: true },
	{ key: 'email', title: 'email', sortable: true },
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

const toggleSelection = (itemId: string, value = null) => {
	const index = selectedItems.value.indexOf(itemId);
	if (value === true || (value === null && index === -1)) {
		selectedItems.value.push(itemId);
	} else if (value === false || index !== -1) {
		selectedItems.value.splice(index, 1);
	}
};

const addNewAccount = () => {
	let id = '0';
	if (items.length) {
		const lastItem = items[items.length - 1];
		if (!lastItem) {
			return;
		}
		id = (Number.parseInt(lastItem.id) + 1).toString();
	}
	addAccount({
		id: id,
		name: `John Doe ${id}`,
		email: `invalid${id}@nowhere.com`,
		description: 'test',
		status: Number.parseInt(id) % 2 === 0 ? 'online' : 'offline',
	});
};

const deleteSelected = async () => {
	if (!selectedItems.value.length) return;
	selectedItems.value.forEach((id) => {
		deleteAccount(id);
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
