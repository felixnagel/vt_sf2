<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use LuckyNail\SimpleForms\Form;
use Symfony\Component\Yaml\Yaml;
use AppBundle\Entity\Map;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class EditorController extends DefaultController implements AuthentificatedController{
    /**
     * @Route("/editor/new"), name="editor/new")
     */
    public function newAction(){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

        $oMap = new Map();
        $oMap->setCreatedBy($iUserId);

        $oEm = $this->getDoctrine()->getManager();
        $oEm->persist($oMap);
        $oEm->flush();

        return $this->redirect($this->generateUrl('editor/create', ['map_id' => $oMap->getId()]));
    }

    /**
     * @Route("/editor/load/{map_id}", name="editor/load")
     */
    public function loadAction($map_id){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

        $oMap = $this->_load_map($map_id);

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
        $iMapId = $map_id;

        $aTplData = [
            'aBlockDefinitions' => $this->container->getParameter('app.blocks'),
            'aBrushes' => $this->container->getParameter('app.brushes'),
            'iMapId' => $iMapId,
        ];

        return $this->render('map/create.html.twig', $aTplData);
    }

    /**
     * @Route("/editor/save", name="editor/save")
     */
    public function saveAction(Request $oRequest){
        $map_id = $oRequest->get('map_id');
        if(!is_numeric($map_id)){
            $sMapId = serialize($map_id);
            throw new \Exception(sprintf(
                'No numeric value given for iMapId! | map_id[%s]', $sMapId
            ));
        }
        $iMapId = (int)$map_id;
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

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

        return new JsonResponse('1');
    }
}
