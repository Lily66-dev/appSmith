export default {
	activeProduct: null,
	setActiveEditProduct: (activeProduct) => {
		this.activeProduct = activeProduct;
	},
	handleValidAdd:async()=>{
		const formDatas = frm_Class.data
		const isExistName = await Duplicate_course_category_n_a.run({
			name:formDatas.form_input_category
		})
		if(!!isExistName.length){
			showAlert('存在相同的分类名称', 'error');
			return false
		}
 
		const isExistCategory = await Exist_course_by_ids.run({
			course_ids:formDatas.course_name
		})
		console.log("isExistCategory",isExistCategory)
		//功能有问题暂时不校验-目的测试需要测主流程
		// if(!isExistCategory.length){
			// showAlert('存在分类已经被删除', 'error');
			// this.activeProduct = {
				// name:formDatas.form_input_category,
				// sort:formDatas.form_input_sort,
			// }
			// resetWidget('course_name',true)
			// return false
		// }

		return true
	},
	handleValidUpdate:async()=>{
		const formDatas = frm_Class.data
		const isExistName = await Duplicate_course_category_n_u.run({
			name:formDatas.form_input_category,
			id:this.activeProduct.id
		})
		console.log("isExistName",isExistName)
		if(!!isExistName.length){
			showAlert('存在相同的分类名称', 'error');
			this.activeProduct.name = formDatas.form_input_category
			return false
		}

		const isExistCategory = await Exist_course_by_ids.run({
			course_ids:formDatas.course_name
		})
		console.log("formDatas.course_name",formDatas.course_name)
		console.log("isExistCategory",isExistCategory)
		if(!isExistCategory.length){
			showAlert('存在分类已经被删除', 'error');
			this.activeProduct = {
				name:formDatas.form_input_category,
				sort:formDatas.form_input_sort,
			}
			resetWidget('course_name',true)
			return false
		}

		return true
	},
	addClass: async () => {
		const isValid = await this.handleValidAdd()
		if(!isValid) return
		console.log("course_name",frm_Class.data.course_name)
		await course_category_insert.run({
			create_account:await this.getUserName(),
			course_ids:frm_Class.data.course_name
		})

		closeModal(add_data_modal.name);
		showAlert('操作成功', 'success');
		this.activeProduct = null;
		resetWidget('frm_Class',true)
		course_category_search.run();
		course_category_total.run();
	},
	updateClass: async () => {
		const isValid = await this.handleValidUpdate()
		if(!isValid) return

		await course_category_update.run({
			id:this.activeProduct.id,
			modify_account:await this.getUserName(),
			course_ids:frm_Class.data.course_name
		})

		closeModal(add_data_modal.name);
		showAlert('操作成功', 'success');
		this.activeProduct = null;
		resetWidget('frm_Class',true)
		course_category_search.run();
		course_category_total.run();
	},
	deleteData: async () => {
		const isExistFiles = await Exist_Courseware_By_categoryId.run({
			id:Table2.tableData[Table2.triggeredRowIndex].id
		}) 
		if(!!isExistFiles.length){
			showAlert('删除失败，该分类下面存在文件', 'error');
			return
		}
		await course_category_del.run({
			id: Table2.tableData[Table2.triggeredRowIndex].id,
			modify_account: await this.getUserName(),
		});

		await course_category_search.run();
		course_category_total.run();
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
		resetWidget('frm_Class',true)
	}}