<template>
	<div class="flex h-full flex-col overflow-hidden">
		<div class="shrink-0">
			<v-row class="mb-4">
				<v-col
					cols="12"
					sm="6"
					class="flex gap-5"
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
		</div>

		<!-- List View -->
		<div
			v-if="viewMode === 'list'"
			class="grow overflow-auto rounded-lg bg-[rgb(var(--v-theme-background))]"
		>
			<v-data-table
				v-model="selectedItems"
				:headers="listHeaders"
				:items="items"
				:items-per-page="25"
				:items-per-page-options="[25, 50, 100, { value: -1, title: 'All' }]"
				height="100%"
				class="h-full rounded-lg p-2 shadow-sm"
				:search="search"
				item-value="id"
				show-select
				fixed-header
			>
				<template #item.name="{ item }">
					<div class="flex items-center">
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
							class="no-underline text-[rgb(var(--v-theme-on-surface))]"
						>
							{{ item.name }}
						</router-link>
					</div>
				</template>
				<template #item.actions="{ item }">
					<div class="flex justify-end">
						<v-btn
							icon="mdi-dots-vertical"
							variant="text"
							size="small"
							:to="`/item/${item.id}`"
						/>
					</div>
				</template>
			</v-data-table>
		</div>

		<!-- Grid View -->
		<div
			v-if="viewMode === 'grid'"
			class="grow overflow-auto"
		>
			<v-row class="m-0">
				<v-col
					v-for="item in items"
					:key="item.id"
					cols="12"
					sm="6"
					md="4"
					lg="3"
				>
					<v-card
						class="h-full cursor-pointer"
						:class="{ 'bg-gray-700': selectedItems.includes(item.id) }"
						hover
						rounded="lg"
						@click="toggleSelection(item.id)"
					>
						<v-card-item>
							<!-- Avatar with error fallback -->
							<v-avatar
								size="56"
								class="mx-auto mb-3 block"
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

							<div class="flex items-center justify-center truncate text-h6 font-bold">
								<router-link
									:to="`/item/${item.id}`"
									class="no-underline text-[rgb(var(--v-theme-on-surface))]"
								>
									{{ item.name }}
								</router-link>
							</div>
							<v-card-text class="mb-2 flex items-center justify-center truncate p-0 text-sm">
								{{ item.email }}
							</v-card-text>
							<v-card-text class="flex items-center justify-center truncate p-0 text-sm">
								{{ item.description }}
							</v-card-text>
						</v-card-item>
					</v-card>
				</v-col>
			</v-row>
		</div>
	</div>
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

const { $state, deleteAccount, addAccount, getAccounts } = useAccountListData();
getAccounts();

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
		id = (Number.parseInt(lastItem.id, 10) + 1).toString();
	}
	addAccount({
		id: id,
		name: `John Doe ${id}`,
		email: `invalid${id}@nowhere.com`,
		description: 'test',
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
