export default {
	activeProduct: {...appsmith.URL.queryParams},
	chapters:[],
	courseWare:[],
	groupIds(metadata,id,secondId) {
		const result = {};

		metadata.forEach(item => {
			const value = item[id];
			const secondValue = item[secondId];

			if (!result[value]) {
				result[value] = [];
			}
			result[value].push(secondValue);
		});

		return result;
	},
	getBaseData:async ()=>{
		const courseWare = await courseware_query.run()
		this.courseWare = courseWare

		if(appsmith.URL.queryParams?.id){
			const courseData = await course_pre_update.run({id:appsmith.URL.queryParams.id})
			const currentCourse =  courseData[0]
			this.activeProduct = currentCourse
			console.log(currentCourse,"currentCourse")

			const categoryData = await course_pre_update_category.run({id:currentCourse.id})
			const categoryIds = categoryData.map(item => item.category_id)
			this.activeProduct.categoryIds = categoryIds

			const chapterData = await course_pre_update_chaptor.run({id:currentCourse.id})
			console.log(chapterData,"chapterData")

			// 查找资料
			const chapterIds = chapterData.map(item => item.id)
			const coursewareData = await course_pre_update_courseware.run({chapter_ids:chapterIds})
			const relationCoursewareData = this.groupIds(coursewareData,"chapter_id","courseware_id")
			console.log(coursewareData,"coursewareData")

			// 查找考试
			const examData = await course_pre_update_exam.run({chapter_ids:chapterIds})
			const relationExamData = this.groupIds(examData,"chapter_id","exam_id")
			console.log(examData,"examData")

			const formatChapterData = chapterData.map(item => {
				const id =item.id
				return {
					...item,
					parentId:item.parent_id,
					attachments:relationCoursewareData[id] ?? [],
					quizzes:relationExamData[id] ?? []
				}
			})

			console.log(formatChapterData,"formatChapterData")

			this.chapters =  formatChapterData
		}
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
	handleFilesSelect:async () => {
		const files  = cover_img.files
		const formDatas = InfoForm.data
		const loanDocumentExists = files && files.length > 0;
		if (loanDocumentExists) {
			const file = files[0]
			const loanDocument = await Upload.run();
			this.activeProduct = {
				name:formDatas.title,
				description:formDatas.description,
				cover_img_path : loanDocument.data
			}
		}
	},
	addForm:async (status) => {
		// const isValid = await this.checkValues()
		// if(!isValid) return
		const formDatas = InfoForm.data
		const isEdit = !!this.activeProduct?.id
		const params = {
			cover_img_path:this.activeProduct.cover_img_path
		}

		const userName = await this.getUserName()
		if(isEdit){
			params.create_account = userName
			// status  1-草稿 2-已发布 3-已撤销
			params.status = +status
			params.chapters = this.chapters
			console.log(params,"最重的参数isEdit")
			console.log(JSON.stringify(params),"最重的参数jsonisEdit")
			await course_update.run(params)
		} else {
			params.create_account = userName
			params.modify_account = userName
			// status  1-草稿 2-已发布 3-已撤销
			params.status = +status
			params.chapters = this.chapters
			console.log(params,"最重的参数")
			console.log(JSON.stringify(params),"最重的参数json")

			await course_add.run(params)
		}

		resetWidget('InfoForm',true)
		showAlert('操作成功', 'success');
		this.activeProduct = {};
		navigateTo('课程管理', {}, 'SAME_WINDOW');
	},
	checkValues:async () => {
		const editData = InfoForm.data
		const isExistCategory = await Exist_Courseware_By_cate.run({
			category_id: editData.course_category
		})

		if (!isExistCategory.length) {
			showAlert('课程分类已被删除', 'error');
			resetWidget("course_category",true)
			this.activeProduct = {
				...this.activeProduct,
				name:editData.title,
				description:editData.description,
				cover_img_path : editData.cover_img_path,
				credit: editData.credit,
			}
			return false
		}

		return true
	},
	handleNavigateToChaper:()=>{
		const formDatas = InfoForm.data
		this.activeProduct = {
			...this.activeProduct,
			name:formDatas.title,
			description:formDatas.description,
			credit:formDatas.credit,
		}
		{{navigateTo('课程章节管理', this.activeProduct, 'SAME_WINDOW');}}
	},
	handleSaveChapter:(chapters)=>{
		console.log(chapters,"handleSaveChapter")
		this.chapters = chapters
	}
}