export default {
	getCourseList: () => {
		return [
			{
				label: '草稿',
				value: 1,
				color: '#EBA400',
			},
			{
				label: '已发布',
				value: 2,
				color: '#22C55E',
			},
			{
				label: '已撤销',
				value: 3,
				color: '#FA5151',
			},
		]
	},
	getCourseStatus: (value,) => {
		return this.getCourseList().find(item => item.value === value)?.label || '';
	},
	getCourseStatusColor: (value) => {
		return this.getCourseList().find(item => item.value === value)?.color || '';
	},
	publishData: async () => {
		const username = await this.getUserName()
		await course_publish.run({
			id: container_right_table.tableData[container_right_table.triggeredRowIndex].id,
			modify_account: username,
		});

		await course_search.run();
		course_total.run()
		showAlert('操作成功', 'success');
	},
	repealData: async () => {
		const username = await this.getUserName()
		await course_repeal.run({
			id: container_right_table.tableData[container_right_table.triggeredRowIndex].id,
			modify_account: username,
		});

		await course_search.run();
		course_total.run()
		showAlert('操作成功', 'success');
	},
	deleteData: async () => {
		const username = await this.getUserName()
		await course_del.run({
			id: container_right_table.tableData[container_right_table.triggeredRowIndex].id,
			modify_account: username,
		});

		await course_search.run();
		course_total.run()
		showAlert('操作成功', 'success');
	},
	getUserName: async () => {
		const holder = window?.$holder || {};
		let userInfo = null
		if (holder.getUserInfo) {
			userInfo = (await holder?.getUserInfo()) || {};
		}
		const userName = appsmith?.user?.username ?? userInfo?.username
		return userName
	},
	handleSearch: async () => {
		const pattern = /^\s*[\u4e00-\u9fa5a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+\s*$/

		if ((form_input_filename.text && !pattern.test(form_input_filename.text))) {
			return;
		}
		resetWidget("container_right_table", true).then(()=>{
			course_search.run();
			course_total.run()
		})
	},
	handleResetSearch: async () => {
		resetWidget("container_right_search", true).then(()=>{
			this.handleSearch()
		})
	},
}