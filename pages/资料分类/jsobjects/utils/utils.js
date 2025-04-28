export default {
	activeProduct: null,
	setActiveEditProduct: (activeProduct) => {
		this.activeProduct = activeProduct;
	},
	addClass: async () => {
		const formDatas = frm_Class.data
		const isExistName = await Duplicate_category_by_name_add.run({
			name:formDatas.form_input_category
		})
		if(!!isExistName.length){
			showAlert('存在相同的分类名称', 'error');
			this.activeProduct = {
				name:formDatas.form_input_category,
				sort:formDatas.form_input_sort
			}
			return
		}
		await Insert_category.run({
			create_account:await this.getUserName()
		})

		closeModal(add_data_modal.name);

		showAlert('操作成功', 'success');

		this.activeProduct = null;

		Select_category2.run();
		Total_record_category2.run()
	},
	updateClass: async () => {
		const formDatas = frm_Class.data
		const isExistName = await Duplicate_category_by_name.run({
			name:formDatas.form_input_category,
			id:this.activeProduct.id
		})
		console.log(isExistName,"isExistName")
		if(!!isExistName.length){
			showAlert('存在相同的分类名称', 'error');
			this.activeProduct.name = formDatas.form_input_category
			return
		}
		await Update_category2.run({
			id:this.activeProduct.id,
			modify_account:await this.getUserName()
		})

		closeModal(add_data_modal.name);

		showAlert('操作成功', 'success');

		this.activeProduct = null;

		Select_category2.run();
		Total_record_category2.run()
	},
	deleteData: async () => {
		const isExistFiles = await Exist_Courseware_By_categoryId.run({
			id:Table2.tableData[Table2.triggeredRowIndex].id
		}) 
		if(!!isExistFiles.length){
			showAlert('删除失败，该分类下面存在文件', 'error');
			return
		}
		await Delete_category.run({
			id: Table2.tableData[Table2.triggeredRowIndex].id,
			modify_account: await this.getUserName(),
		});

		await Select_category2.run();
		Total_record_category2.run()


		closeModal(delete_class.name);

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
	clearModal:()=>{
		this.activeProduct = null;
		closeModal(add_data_modal.name);
	}}