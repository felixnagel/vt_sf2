<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use AppBundle\Entity\Map;
use AppBundle\Entity\Times;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class EditorController extends DefaultController implements AuthentificatedController{
    /**
     * @Route("/editor/new"), name="editor/new")
     */
    public function newAction(){
        $iUserId = $this->_get_user_id_from_session();

        $oMap = new Map();
        $oMap->setCreatedBy($iUserId);

        $oEm = $this->getDoctrine()->getManager();
        $oEm->persist($oMap);
        $oEm->flush();

        return $this->redirect($this->generateUrl('editor/create', ['map_id' => $oMap->getId()]));
    }

    /**
     * @Route("/editor/load", name="editor/load")
     */
    public function loadAction(){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();
        
        $oMap = $this->_get_map($iMapId);
        if($oMap->getCreatedBy() != $iUserId){
            throw new \Exception(sprintf(
                'Map createdBy differs from iUserId! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }
        if($oMap->getReleasedAt() !== null){
            throw new \Exception(sprintf(
                'Map was already released! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }

        return new JsonResponse($oMap->getBlocks());
    }

    /**
     * @Route("/editor/create/{map_id}", name="editor/create")
     */
    public function createAction($map_id){
        $this->_set_current_map($map_id);

        $aTplData = [
            'aC_blocks' => $this->container->getParameter('app.blocks'),
            'aC_brushes' => $this->container->getParameter('app.brushes'),
            'aC_dirs' => $this->container->getParameter('app.base_urls'),
            'aC_map' => $this->container->getParameter('app.map'),
        ];

        return $this->render('map/create.html.twig', $aTplData);
    }

    /**
     * @Route("/editor/save", name="editor/save")
     */
    public function saveAction(Request $oRequest){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map();

        $oMap = $this->getDoctrine()->getRepository('AppBundle:Map')->findOneBy([
            'createdBy' => $iUserId,
            'id' => $iMapId,
        ]);
        if(!$oMap){
            throw new \Exception(sprintf(
                'No map to save could be found in DB! | user_id[%s], map_id[%s]', $iUserId, $iMapId
            ));
        }

        $blocks = $oRequest->get('blocks');
        if(!is_string($blocks)){
            $sBlocks = serialize($blocks);
            throw new \Exception(sprintf(
                'Delivered block data is not a String! | user_id[%s], map_id[%s], blocks[%s]', $iUserId, $iMapId, $sBlocks
            ));
        }
        $sBlocks = (string)$blocks;
        if($sBlocks !== $oMap->getBlocks()){
            $oMap->setReleasedAt(null);
            $oTimes = $this->_get_player_time($iMapId, $iUserId);
            $oTimes->setFinishTime(null);
            $oTimes->setCheckpointTimes(null);
            $oTimes->setCreatedAt(null);
        }
        $oMap->setBlocks($sBlocks);

        $title = $oRequest->get('title');
        if(!is_string($title)){
            $sTitle = serialize($title);
            throw new \Exception(sprintf(
                'Delivered map title is not a string! | user_id[%s], map_id[%s], title[%s]', $iUserId, $iMapId, $sTitle
            ));
        }
        $sTitle = (string)$title;
        $oMap->setTitle($sTitle);

        $oEm = $this->getDoctrine()->getManager();
        $oEm->flush();

        return new JsonResponse();
    }
}
