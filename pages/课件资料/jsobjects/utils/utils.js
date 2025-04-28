export default {
	activeProduct: null,
	setActiveEditProduct: (activeProduct) => {
		console.log(activeProduct,"activeProduct")
		this.activeProduct = activeProduct;
	},
	addUploadData:async () => {
		const submitData = frm_newApplication.data

		const holder = window?.$holder || {};
		let userInfo = null
		if (holder.getUserInfo) {
			userInfo = (await holder?.getUserInfo()) || {};
		}

		const files = fpk_documentUpload.files
		const file = files[0]
		const username = appsmith?.user?.username ?? userInfo?.username
		const fileName = this.getFileName(file.name)

		const isFileNameLimit100 = this.checkFileName(fileName)
		if(!isFileNameLimit100) return

		const loanDocument = await Upload_add.run({
			file: files,
		});
		console.log(loanDocument,"loanDocument")

		const params = {
			name: fileName,
			category_id: submitData.category_name_select,
			public: submitData.is_pulic_radio,
			file_path: loanDocument.data,
			file_type: this.getFileType(file.name),
			file_size: this.autoFileSize(file.size),
			create_account: username,
			modify_account: username,
			yn: 1
		}
		const isExistCategory = await Exist_category_by_id.run({
			category_id:submitData.category_name_select
		})
		if(!isExistCategory.length){
			showAlert('资料分类已被删除', 'error');
			resetWidget("category_name_select",true)
			return
		}

		await Insert_courseware1.run(params)
		search_total.run()
		await search.run();
		closeModal(add_upload_data_modal.name);
		resetWidget('frm_newApplication',true)
		showAlert('操作成功', 'success');
		resetWidget('frm_newApplication',true)

	},
	updateProduct: async () => {
		const editData = edit_frm_newApplication.data
		const isExistCategory = await Exist_category_by_id.run({
			category_id: editData.edit_sel_creditProduct
		})

		if (!isExistCategory.length) {
			showAlert('资料分类已被删除', 'error');
			resetWidget("edit_sel_creditProduct",true)
			return
		}

		const holder = window?.$holder || {};
		let userInfo = null
		if (holder.getUserInfo) {
			userInfo = (await holder?.getUserInfo()) || {};
		}
		const username = appsmith?.user?.username ?? userInfo?.username

		const files = edit_fpk_documentUpload.files
		const loanDocumentExists = files && files.length > 0;

		if (loanDocumentExists) {
			const file = files[0]

			const isFileNameLimit100 = this.checkFileName(fileName)

			if(!isFileNameLimit100) return
			console.log(files,"files")

			const loanDocument = await Upload_edit.run();
			console.log(loanDocument,"loanDocument")


			this.activeProduct.name = fileName
			this.activeProduct.file_path = loanDocument.data
			this.activeProduct.file_type = this.getFileType(file.name)
			this.activeProduct.file_size = this.autoFileSize(file.size)
		}

		const submitData = this.activeProduct
		console.log(this.activeProduct,"this.activeProduct")

		const params = {
			name: submitData.name,
			category_id: editData.edit_sel_creditProduct,
			public: editData.edit_RadioGroup1,
			file_path: submitData.file_path,
			file_type: submitData.file_type,
			file_size: submitData.file_size,
			create_time: submitData.create_time,
			create_account: submitData.create_account,
			modify_account: username,
			id: submitData.id,
			yn: 1
		}

		console.log(params, "Update_courseware1")
		await Update_courseware1.run(params);
		this.clearModal()

		showAlert('操作成功', 'success');
		resetWidget('edit_frm_newApplication',true)

		await search.run();
		search_total.run()
	},
	deleteData: async () => {
		const holder = window?.$holder || {};
		let userInfo = null
		if (holder.getUserInfo) {
			userInfo = (await holder?.getUserInfo()) || {};
		}
		const username = appsmith?.user?.username ?? userInfo?.username
		await Delete_courseware1.run({
			id: container_right_table.tableData[container_right_table.triggeredRowIndex].id,
			modify_account: username,
		});

		await search.run();
		search_total.run()
		showAlert('操作成功', 'success');
	},
	clearFilePath: () => {
		this.activeProduct.file_path = undefined
		this.activeProduct.file_type = undefined
		this.activeProduct.file_size = undefined
		this.activeProduct.name = undefined
		this.activeProduct.category_id = edit_sel_creditProduct.selectedOptionValue
		this.activeProduct.public = edit_RadioGroup1.selectedOptionValue

		resetWidget('edit_fpk_documentUpload',true)
	},
	setFilePath:  () => {
		console.log(1212)
		const file = edit_fpk_documentUpload.files[0]

		this.activeProduct.name = this.getFileName(file.name)
		this.activeProduct.file_type = this.getFileType(file.name)
		this.activeProduct.file_size = this.autoFileSize(file.size)
	},
	getFileName: (name) => {
		// 获取名称 不包含扩展名 名称里面有小数点

		const nameArr = name.split('.')
		nameArr.pop()
		return nameArr.join('.')
	},
	autoFileSize: (bytes) => {
		const mb = bytes / 1024 / 1024;
		if (mb < 0.01) {
			const kb = bytes / 1024;
			return kb.toFixed(2) + 'KB';
		}
		return mb.toFixed(2) + 'MB';
	},
	getFileType: (name) => {
		const names = name.split('.')
		const ext = names[names.length - 1].toLowerCase()
		return ext
	},
	clearModal:()=>{
		this.activeProduct = null;
		resetWidget('edit_frm_newApplication',true)
		closeModal(edit_upload_data_modal.name);
	},
	handleSearch: async () => {
		const pattern = /^\s*[\u4e00-\u9fa5a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+\s*$/

		if ((form_input_filename.text && !pattern.test(form_input_filename.text))
				|| (form_input_personname.text && !pattern.test(form_input_personname.text))) {
			return;
		}
		resetWidget("container_right_table", true).then(()=>{
			search.run();
			search_total.run()
		})
	},
	handleResetSearch: async () => {
		resetWidget("container_right_search", true).then(()=>{
			this.handleSearch()
		})
	},
	checkFileName: (name) => {
		if (name.length > 100) {
			showAlert('文件名称不能超过100个字符', 'error');
			return false;
		}
		return true;
	}
}