<template>
    <div class="container">
        <a-input-search placeholder="input subset name" size="small" @search="handleAdd" enter-button="Add">
        </a-input-search>
        <div id="subsettable">
            <a-table bordered :data-source="dataSource" size="small" :columns="columns" :custom-row="customRow" :scroll="{ y: true }">
                <template #name="{ text, record }">
                <div class="editable-cell">
                    <div v-if="editableData[record.key]" class="editable-cell-input-wrapper">
                    <a-input v-model:value="editableData[record.key].name" @pressEnter="save(record.key)" />
                    <check-outlined class="editable-cell-icon-check" @click="save(record.key)" />
                    </div>
                    <div v-else class="editable-cell-text-wrapper">
                    {{ text || ' ' }}
                    <edit-outlined class="editable-cell-icon" @click="edit(record.key)" />
                    </div>
                </div>
                </template>
                <template #operation="{ record }">
                <a-popconfirm
                    v-if="dataSource.length"
                    title="Sure to delete?"
                    @confirm="onDelete(record.key)"
                >
                    <a>Delete</a>
                </a-popconfirm>
                </template>
            </a-table>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, Ref, ref, UnwrapRef, h } from 'vue';
import { useStore } from 'vuex';
import { CheckOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { cloneDeep } from 'lodash';
import { select } from 'd3';

interface DataItem {
  key: string;
  name: string;
  amount: number;
}

export default defineComponent({
    name:"SubsetContainer",
    components: {
    CheckOutlined,
    EditOutlined,
  },
  setup() {
    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
        width: '40%',
        slots: { customRender: 'name' },
      },
      {
        title: 'amount',
        dataIndex: 'amount',
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
      },
    ];
    const dataSource: Ref<DataItem[]> = ref([]);
    const count = computed(() => dataSource.value.length + 1);
    const editableData: UnwrapRef<Record<string, DataItem>> = reactive({});

    const edit = (key: string) => {
      editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
    };
    const save = (key: string) => {
      Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
      delete editableData[key];
    };

    const onDelete = (key: string) => {
      dataSource.value = dataSource.value.filter(item => item.key !== key);
    };

    // ================= for add subset input ===================//
    const store = useStore();
    const selecteddata : Ref<[]> = computed(()=>store.state.selecteddata);
    const handleAdd = (name) => {
        if(selecteddata.value.length===0){
            notification.open({
                message: `No data is selected!`,
                // description:
                // 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
                icon: h(WarningOutlined, { style: 'color: #faad14' }),
                placement:'bottomLeft',
                duration: 1.5,
            });
        }else{
            const newData = {
                key: `${count.value}`,
                name: name,
                amount: selecteddata.value.length,
                values: selecteddata.value
            };
            dataSource.value.push(newData);
        }
    };

    // ================= for table row selection ===================//
    let selectedrows= {};
    const customRow = (record) => {
        return {
            onClick: () => {
                selectedrows=record;
                select('#subsettable')
                .selectAll('tr')
                .style('background','none');
                select('#subsettable')
                .selectAll(`tr[data-row-key='${record.key}']`)
                .style('background','#e6f7ff')
                store.commit('updateSelectedData',record.values)
            },
        };
    };

    return {
      columns,
      onDelete,
      handleAdd,
      dataSource,
      editableData,
      count,
      edit,
      save,
      customRow
    };
  },
})
</script>

<style lang="less" scoped>
.container{
    padding: 1px;
}
.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 2px 22px 2px 2px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: -3px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 15px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
#subsettable{
    // margin-top: 5px;
    height: fit-content;
}

</style>