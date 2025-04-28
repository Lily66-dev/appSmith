export default {
	activeProduct: null,
	setActiveEditProduct: (activeProduct) => {
		console.log(activeProduct,"activeProduct")
		this.activeProduct = activeProduct;
	},
prepareAuthUrl: async function(targetUrl) {
    // 获取token
    let token = appsmith.user.token || ""; // 使用appsmith API获取token
    
    if (!token && storeValue) {
      // 尝试从store获取
      token = appsmith.store.token;
    }
	token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGOHJzQXNKcTVqc2JNd0M2RzgydGpMaDRBMDBPR3Vtem43dUZJOV96SXI4In0.eyJleHAiOjE3NDUzMjE5NTEsImlhdCI6MTc0NTI4NTk1MSwianRpIjoiOGQxZTBlYmEtNjE1MC00MjYzLWFlOWEtZWE1NWY2NGFiMzBhIiwiaXNzIjoiaHR0cHM6Ly9wYWFzLWF1dGgtcmUuaG9sZGVyem9uZS5jbi9yZWFsbXMvcGFhcyIsInN1YiI6ImY6ZjAzNGUyMTktZjdiMi00ZTQzLTlmM2YtZTAyZDk0MDczZTc0OjEwNjY0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaG9sZGVyLXBjIiwic2Vzc2lvbl9zdGF0ZSI6IjBhNjFlMDI0LWE3NDYtNGNhZi04ZDMwLTU3ODExODBmZWQzMCIsImFjciI6InFyY29kZSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNlcnZpY2VfdmVyc2lvbiI6InYxIiwic2lkIjoiMGE2MWUwMjQtYTc0Ni00Y2FmLThkMzAtNTc4MTE4MGZlZDMwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiUkUtQkxCIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiMTg2MjgzNTE3OTEiLCJnaXZlbl9uYW1lIjoiUkUtQkxCIiwiZW1haWwiOiIifQ.cmlViq_wba8jd8UDHRMDG2VdgXr-L-gIh-lCrRkHZlcJhAm6g6oJGaeA5yQYvT0jMAyBQsYUrsMw7vYomlNd3uLXMzYeJAWaVm4RU0UYo4w_5ATbHZ223gDLmzDfTCu1Sen-HakG90h94L6KLkcZGYF6CvBHMW-yokEaWNirilLXyGYQQwCFPwb4lMsNGPY9DSBP1QO-04TPng1JSLfhwh1f6MhwLBjUdVFgMFb8pi6di8WPRqO0WGKFsnpmhNxRuQtuqWUkEMJtH96GXa8YoakRqxGnWSlsNCYnluuzF2JN03E89DBEyY4Ir8UpOXOjChtpyiQkz4gR5RImn_4-VQ";
    
    if (!token) {
      showAlert("无法获取认证令牌", "error");
      return "";
    }
    
    // 创建一个中间HTML页面内容
    const authHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>认证中...</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 50px; }
          .loading { margin: 20px; }
          .error { color: red; margin-top: 20px; }
        </style>
        <script>
          window.onload = async function() {
            try {
						console.log("123125");
              const response = await fetch("${targetUrl}", {
                method: "GET",
                headers: { "Authorization": "Bearer ${token}" },
                credentials: "include"
              });
              
              if (!response.ok) {
                throw new Error("认证失败: " + response.status);
              }
              
              window.location.href = "${targetUrl}";
            } catch (error) {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').textContent = error.message;
              document.getElementById('error').style.display = 'block';
            }
          };
        </script>
      </head>
      <body>
        <h2>正在连接到第三方服务</h2>
        <div id="loading" class="loading">加载中...</div>
        <div id="error" class="error" style="display: none;"></div>
      </body>
      </html>
    `;
    
    // 将HTML内容转为Base64编码(用于data URL)
    const base64Html = btoa(unescape(encodeURIComponent(authHtml)));
	console.log("123123");
    return "data:text/html;base64," + base64Html;
  },
  
  // 加载认证页面
  loadAuthenticatedSite: async function(targetUrl) {
    const authUrl = await this.prepareAuthUrl(targetUrl);
		console.log("123123-3",authUrl);
    if (authUrl) {
			console.log("123123-1");
      // 使用Appsmith API更新iframe组件
      return authUrl; // 返回URL给iframe组件使用
    }
		console.log("123123-2");
    return "";
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

			const fileName = this.getFileName(file.name)
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